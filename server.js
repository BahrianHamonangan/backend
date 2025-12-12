const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS UNTUK SEMUA ORIGIN (UNTUK DEVELOPMENT)
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ ERROR HANDLING GLOBAL
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Route
app.use('/auth', require('./routes/auth'));
app.use('/bookmarks', require('./routes/bookmark'));

// ✅ DEFAULT ROUTE UNTUK CEK KESEHATAN
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
