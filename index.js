const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// 🗄️ SQLite DB
const db = new sqlite3.Database("./orbit.db");

// 📦 Tabelle erstellen
db.run(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  content TEXT,
  creator TEXT
)
`);

// 💾 Seite speichern / updaten
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body;

  if (!name || !name.endsWith(".orbit")) {
    return res.json({ error: "Nur .orbit Seiten erlaubt" });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content, creator) VALUES (?, ?, ?)",
    [name, content, creator || "unknown"],
    (err) => {
      if (err) return res.json({ error: "Speicherfehler" });
      res.json({ success: true });
    }
  );
});

// 📄 Seite laden
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT content FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) {
        return res.json({ content: "Seite nicht gefunden" });
      }

      res.json({ content: row.content });
    }
  );
});

// 🌍 Explorer (öffentliches Orbit Internet)
app.get("/explore", (req, res) => {
  db.all("SELECT name, creator FROM pages", (err, rows) => {
    res.json(rows);
  });
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Orbit Web Network läuft auf Port " + PORT);
});
