const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

// DATABASE
const db = new sqlite3.Database("./orbit.db");

// INIT TABLES
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

  // ✅ NO START COINS (START = 0)
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    if (!row) {
      db.run("INSERT INTO user (id, coins) VALUES (1, 0)");
    }
  });

});

// FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET COINS
app.get("/coins", (req, res) => {
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    if (err || !row) {
      return res.json({ coins: 0 });
    }
    res.json({ coins: row.coins });
  });
});

// SYNC COINS
app.post("/coins/sync", (req, res) => {
  const { coins } = req.body || {};

  if (typeof coins !== "number") {
    return res.json({ error: "INVALID COINS" });
  }

  db.run(
    "UPDATE user SET coins = ? WHERE id = 1",
    [coins],
    () => res.json({ ok: true })
  );
});

// ADD COINS (CODE SYSTEM)
app.post("/coins/add", (req, res) => {
  const { amount, code } = req.body || {};

  if (code !== "081508151235180Rss#") {
    return res.json({ error: "WRONG CODE" });
  }

  const add = Number(amount);

  if (!add || add <= 0) {
    return res.json({ error: "INVALID AMOUNT" });
  }

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [add],
    () => res.json({ ok: true })
  );
});

// SAVE PAGE
app.post("/page/save", (req, res) => {
  const { name, content } = req.body || {};

  if (!name || typeof name !== "string") {
    return res.json({ error: "NO NAME" });
  }

  if (!name.endsWith(".orbit") && !name.startsWith("neue_")) {
    return res.json({ error: "INVALID NAME" });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content) VALUES (?, ?)",
    [name, content || ""],
    (err) => {
      if (err) return res.json({ error: "DB ERROR" });
      res.json({ ok: true });
    }
  );
});

// LOAD PAGE
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT content FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (err || !row) {
        return res.json({ content: "404 NOT FOUND" });
      }
      res.json({ content: row.content });
    }
  );
});

// ALL PAGES (EXPLORER)
app.get("/pages", (req, res) => {
  db.all("SELECT name FROM pages", (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Orbit FULL SYSTEM RUNNING on port " + PORT);
});
