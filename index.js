const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(bodyParser.json());

// SQLite
const db = new sqlite3.Database("./orbit.db");

db.run(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  content TEXT,
  creator TEXT
)
`);

// UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// PAGE LOAD
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT content FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) return res.json({ content: "404 ORBIT PAGE NOT FOUND" });
      res.json(row);
    }
  );
});

// UPLOAD
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body;

  if (!name.endsWith(".orbit")) {
    return res.json({ error: "ONLY .orbit ALLOWED" });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content, creator) VALUES (?, ?, ?)",
    [name, content, creator || "anon"],
    (err) => {
      if (err) return res.json({ error: "DB ERROR" });
      res.json({ success: true });
    }
  );
});

// EXPLORE
app.get("/explore", (req, res) => {
  db.all("SELECT name, creator FROM pages", (err, rows) => {
    res.json(rows);
  });
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Orbit V2 läuft");
});
