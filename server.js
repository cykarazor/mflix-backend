// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ObjectId } = require("mongodb"); // <-- added this line here

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.log("❌ DB Error:", err));

// Movies route with pagination, search, and sorting
app.get("/api/movies", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("movies");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'title';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const query = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const totalMovies = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / limit);

    const movies = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({
      movies,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// PUT update movie details by _id
app.put("/api/movies/:id", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("movies");

    const movieId = req.params.id;
    const updateData = req.body; // expects an object with fields to update, e.g. { title: "New Title", year: 2023 }

    if (!ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(movieId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json({ message: "Movie updated successfully" });
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ error: "Failed to update movie" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
