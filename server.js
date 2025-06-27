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

// ✅ Connect to MongoDB (no deprecated options)
mongoose.connect(process.env.MONGODB_URI, {
  //useNewUrlParser: true,
  // ❌ Removed: useUnifiedTopology (no longer needed in Mongoose v6+)
});

// 🔄 MongoDB connection event listeners
const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Add health check endpoint so Render knows the service is alive
app.get('/', (req, res) => {
  res.send('🌐 API is running');
});

// ✅ Auth routes
app.use('/api/auth', authRoutes);

// ✅ GET movies with multi-field sorting, pagination, and search
app.get('/api/movies', async (req, res) => {
  try {
    const db = connection.db;
    const collection = db.collection('movies');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'title';
    const sortOrder = req.query.sortOrder || 'asc';

    const sortFields = sortBy.split(',');
    const sortDirections = sortOrder.split(',');
    const sort = {};

    sortFields.forEach((field, idx) => {
      const direction = sortDirections[idx] || 'asc';
      sort[field] = direction.toLowerCase() === 'desc' ? -1 : 1;
    });

    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const totalMovies = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / limit);

    const movies = await collection
      .find(query, { allowDiskUse: true })  // 👈 Add this to enable disk-based sort
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({ movies, totalPages });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// ✅ GET movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const db = connection.db;
    const collection = db.collection('movies');

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

// ✅ PUT update movie
app.put('/api/movies/:id', async (req, res) => {
  try {
    const db = connection.db;
    const collection = db.collection('movies');

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

// ✅ Start the server immediately (not delayed by DB connection)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
