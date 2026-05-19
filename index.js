const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

/* =========================
   DB (SAFE INIT)
========================= */
const db = new sqlite3.Database("./orbit.db");

/* IMPORTANT: SERIALIZE = verhindert Render Crash */
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      content TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      coins INTEGER
    )
  `);

  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    if (!row) {
      db.run("INSERT INTO user (id, coins) VALUES (1, 0)");
    }
  });

});

/* =========================
   FRONTEND
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   COINS
========================= */
app.get("/coins", (req, res) => {
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    res.json({ coins: row ? row.coins : 0 });
  });
});

/* DELTA SYNC */
app.post("/coins/sync", (req, res) => {
  const { delta } = req.body;

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [delta || 0],
    () => res.json({ ok: true })
  );
});

/* OPTIONAL PIN ADD */
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
   PAGES
========================= */
app.post("/page/save", (req, res) => {
  const { name, content } = req.body;

  if (!name) return res.json({ error: "NO NAME" });

  db.run(
    "INSERT OR REPLACE INTO pages (name, content) VALUES (?, ?)",
    [name, content],
    () => res.json({ ok: true })
  );
});

app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT content FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) return res.json({ content: "404 NOT FOUND" });
      res.json({ content: row.content });
    }
  );
});

/* LIST */
app.get("/pages", (req, res) => {
  db.all("SELECT name FROM pages", (err, rows) => {
    res.json(rows || []);
  });
});

/* =========================
   RENDER FIX (PORT IMPORTANT)
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Orbit Server running on port " + PORT);
});
