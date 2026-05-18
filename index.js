const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(bodyParser.json());

// SQLITE
const db = new sqlite3.Database("./orbit.db");

// TABLE
db.run(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  content TEXT,
  creator TEXT
)
`);

// STARTSEITE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// UPLOAD
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body;

  if (!name.endsWith(".orbit")) {
    return res.json({
      error: "Nur .orbit Seiten erlaubt"
    });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content, creator) VALUES (?, ?, ?)",
    [name, content, creator || "unknown"],
    (err) => {
      if (err) {
        return res.json({
          error: "Fehler beim Speichern"
        });
      }

      res.json({
        success: true
      });
    }
  );
});

// PAGE LOAD
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT content FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) {
        return res.json({
          content: "Seite nicht gefunden"
        });
      }

      res.json({
        content: row.content
      });
    }
  );
});

// EXPLORE
app.get("/explore", (req, res) => {
  db.all(
    "SELECT name, creator FROM pages",
    (err, rows) => {
      res.json(rows);
    }
  );
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Orbit läuft auf Port " + PORT);
});
