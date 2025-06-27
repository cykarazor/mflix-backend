require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const authRoutes = require('./routes/auth');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in your environment!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

// Wait for MongoDB to be fully connected
connection.once('open', () => {
  console.log('✅ MongoDB connected');

  const db = connection.db;
  const collection = db.collection('movies');

  // Auth routes
  app.use('/api/auth', authRoutes);

  // GET movies with multi-field sorting support << MODIFIED
  app.get('/api/movies', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'title'; // e.g. 'year,title' << NEW
      const sortOrder = req.query.sortOrder || 'asc'; // e.g. 'desc,asc' << NEW

      // Build MongoDB sort object from comma-separated lists << NEW
      const sortFields = sortBy.split(',');
      const sortDirections = sortOrder.split(',');
      const sort = {};
      sortFields.forEach((field, idx) => {
        const direction = sortDirections[idx] || 'asc';
        sort[field] = direction.toLowerCase() === 'desc' ? -1 : 1;
      });

      // Search filter: case-insensitive regex on title (can be enhanced later) << MODIFIED
      const query = search
        ? { title: { $regex: search, $options: 'i' } }
        : {};

      const totalMovies = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalMovies / limit);

      // Use multi-field sort object in the find query << MODIFIED
      const movies = await collection
        .find(query)
        .sort(sort)  // << CHANGED from single-field sort to multi-field sort
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      res.json({ movies, totalPages });
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });

  // GET movie by ID
  app.get('/api/movies/:id', async (req, res) => {
    try {
      const movieId = req.params.id;

      if (!ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
      }

      const movie = await collection.findOne({ _id: new ObjectId(movieId) });

      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json(movie);
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      res.status(500).json({ error: 'Failed to fetch movie' });
    }
  });

  // PUT update movie
  app.put('/api/movies/:id', async (req, res) => {
    try {
      const movieId = req.params.id;
      const updateData = req.body;

      if (!ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(movieId) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json({ message: 'Movie updated successfully' });
    } catch (error) {
      console.error('Error updating movie:', error);
      res.status(500).json({ error: 'Failed to update movie' });
    }
  });

  // Start server after DB is ready
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

// Handle DB connection errors
connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
