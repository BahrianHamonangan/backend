require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./models/db'); // Pastikan koneksi DB dipanggil
const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmark');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// ROUTES
app.get("/", (req, res) => {
  res.send("Backend berjalan OK di Railway 🚀");
});

// PORT Railway
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
