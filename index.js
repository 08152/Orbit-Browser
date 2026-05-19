const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

/* =========================
   DATABASE
========================= */
const db = new sqlite3.Database("./orbit.db");

/* PAGES TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  content TEXT
)
`);

/* USER TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY,
  coins INTEGER
)
`);

/* INIT USER */
db.get("SELECT * FROM user WHERE id = 1", (err, row) => {
  if (!row) {
    db.run("INSERT INTO user (id, coins) VALUES (1, 0)");
  }
});

/* =========================
   FRONTEND
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   COINS GET
========================= */
app.get("/coins", (req, res) => {
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    if (!row) return res.json({ coins: 0 });
    res.json({ coins: row.coins });
  });
});

/* =========================
   COINS SYNC (OFFLINE DELTA)
========================= */
app.post("/coins/sync", (req, res) => {
  const { delta } = req.body;

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [delta],
    () => {
      res.json({ ok: true });
    }
  );
});

/* =========================
   COINS ADD (PIN SYSTEM OPTIONAL)
========================= */
app.post("/coins/add", (req, res) => {
  const { amount, code } = req.body;

  if (code !== "081508151235180Rss#") {
    return res.json({ error: "WRONG CODE" });
  }

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [amount],
    () => res.json({ ok: true })
  );
});

/* =========================
   SAVE PAGE
========================= */
app.post("/page/save", (req, res) => {
  const { name, content } = req.body;

  if (!name) {
    return res.json({ error: "NO NAME" });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content) VALUES (?, ?)",
    [name, content],
    () => {
      res.json({ ok: true });
    }
  );
});

/* =========================
   LOAD PAGE
========================= */
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT * FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) return res.json({ content: "404 NOT FOUND" });

      res.json({
        content: row.content
      });
    }
  );
});

/* =========================
   ALL PAGES (EXPLORER)
========================= */
app.get("/pages", (req, res) => {
  db.all("SELECT name FROM pages", (err, rows) => {
    res.json(rows);
  });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Orbit Browser Server Running on port " + PORT);
});
