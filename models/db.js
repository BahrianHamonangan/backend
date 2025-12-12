const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ✅ PATH YANG AMAN UNTUK RAILWAY
const dbPath = path.join(process.cwd(), 'bookmark.db');
console.log('Database path:', dbPath); // Untuk debugging

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
    // Coba buat direktori jika belum ada
    const fs = require('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log('✅ Terkoneksi ke SQLite database di path:', dbPath);
  }
});

// Skema tabel (Jaga-jaga jika file bookmark.db kosong)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    coverUrl TEXT,
    komikuUrl TEXT,
    source TEXT DEFAULT 'komiku',
    sourceId TEXT,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`, function(err){
    if(err) console.error('Error creating bookmarks table:', err);
  });

  // Ensure columns exist (for older dbs)
  db.all("PRAGMA table_info('bookmarks')", (err, rows) => {
    if (err) return console.error('PRAGMA error:', err);
    const cols = rows.map(r => r.name);
    if (!cols.includes('source')) {
      db.run("ALTER TABLE bookmarks ADD COLUMN source TEXT DEFAULT 'komiku'");
    }
    if (!cols.includes('sourceId')) {
      db.run("ALTER TABLE bookmarks ADD COLUMN sourceId TEXT");
    }
    if (!cols.includes('komikuUrl')) {
      db.run("ALTER TABLE bookmarks ADD COLUMN komikuUrl TEXT");
    }
  });
});

module.exports = db;
