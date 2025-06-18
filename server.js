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

// Movies route
app.get("/api/movies", async (req, res) => {
  const db = mongoose.connection.db;
  const movies = await db.collection("movies").find().limit(10).toArray();
  res.json(movies);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));