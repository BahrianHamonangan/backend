const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// SQLite (kalau ada)
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err);
  else console.log("✅ Terkoneksi ke SQLite database.");
});

// ROUTE TEST
app.get("/", (req, res) => {
  res.send("Backend Railway OK 🚀");
});

// WAJIB! Port dari Railway
const PORT = process.env.PORT || 8080;

// WAJIB! Gunakan 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
