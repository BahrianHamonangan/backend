const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// GET all bookmarks for current user (if userId present)
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  db.all('SELECT * FROM bookmarks WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Create bookmark manually
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user && req.user.id;
  const { title, coverUrl, komikuUrl, source, sourceId } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  db.run('INSERT INTO bookmarks (userId, title, coverUrl, komikuUrl, source, sourceId) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title || 'No title', coverUrl || '', komikuUrl || '', source || 'manual', sourceId || null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, coverUrl, komikuUrl, source, sourceId });
    });
});

// Import from Komiku URL (scrape)
router.post('/import', authenticateToken, async (req, res) => {
  const { komikuUrl } = req.body;
  if (!komikuUrl) return res.status(400).json({ error: 'URL komik wajib diisi' });
  try {
    const { scrapeKomiku } = require('../utils/scraper');
    const scraped = await scrapeKomiku(komikuUrl);
    const { title, coverUrl } = scraped;
    db.run(`INSERT INTO bookmarks (userId, title, coverUrl, komikuUrl, source, sourceId) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, coverUrl, komikuUrl, 'komiku', komikuUrl],
      function (err) {
        if (err) return res.status(500).json({ error: 'Gagal simpan ke database' });
        res.status(201).json({ id: this.lastID, title, coverUrl, komikuUrl, source: 'komiku', sourceId: komikuUrl });
      }
    );
  } catch (e) {
    console.error('Scraping error:', e);
    res.status(500).json({ error: 'Gagal mengimpor dari komiku.org', detail: e.message || e.toString() });
  }
});

// Import from MangaDex by id or URL
router.post('/import/mangadex', authenticateToken, async (req, res) => {
  const { mangadexIdOrUrl } = req.body;
  if (!mangadexIdOrUrl) return res.status(400).json({ error: 'mangadexIdOrUrl wajib diisi' });
  let mangaId = mangadexIdOrUrl;
  const m = (mangadexIdOrUrl || '').match(/([0-9a-fA-F-]{36})/);
  if (m) mangaId = m[1];
  try {
    const { fetchMangaDetails } = require('../utils/mangadex');
    const details = await fetchMangaDetails(mangaId);
    const { title, coverUrl, mangaUrl } = details;
    db.run(`INSERT INTO bookmarks (userId, title, coverUrl, komikuUrl, source, sourceId) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, coverUrl || '', mangaUrl || '', 'mangadex', mangaId],
      function (err) {
        if (err) return res.status(500).json({ error: 'Gagal simpan ke database' });
        res.status(201).json({ id: this.lastID, title, coverUrl, mangaUrl, source: 'mangadex', sourceId: mangaId });
      }
    );
  } catch (e) {
    console.error('MangaDex import error:', e);
    res.status(500).json({ error: 'Gagal mengimpor dari MangaDex', detail: e.message || e.toString() });
  }
});

// Update bookmark
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  const { title, coverUrl, komikuUrl } = req.body;
  db.run('UPDATE bookmarks SET title = ?, coverUrl = ?, komikuUrl = ? WHERE id = ? AND userId = ?',
    [title, coverUrl, komikuUrl, id, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Bookmark tidak ditemukan' });
      res.json({ id: Number(id), title, coverUrl, komikuUrl });
    });
});

// Delete bookmark
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user.id;
  db.run('DELETE FROM bookmarks WHERE id = ? AND userId = ?', [id, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Bookmark tidak ditemukan' });
    res.json({ message: 'Berhasil dihapus' });
  });
});

module.exports = router;
