require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./models/db');
const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmark');

const app = express();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// === HEALTH CHECK WAJIB UNTUK RAILWAY ===
app.get('/', (req, res) => {
  res.status(200).send("🚀 Komik Bookmark API berjalan!");
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// === PORT FIX UNTUK RAILWAY ===
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan pada port ${PORT}`);
});
