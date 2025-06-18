// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

// Movies route with pagination
app.get("/api/movies", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const moviesCollection = db.collection("movies");

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const totalMovies = await moviesCollection.countDocuments();
    const totalPages = Math.ceil(totalMovies / limit);

    const movies = await moviesCollection.find({})
      .project({ title: 1, year: 1 }) // Optional: only include needed fields
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({ movies, totalPages });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
