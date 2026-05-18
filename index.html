const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(bodyParser.json());

// DATABASE
const db = new sqlite3.Database("./orbit.db");

// PAGES TABLE
db.run(`
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  content TEXT,
  creator TEXT
)
`);

// COINS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY,
  coins INTEGER
)
`);

// INIT USER
db.get("SELECT * FROM user WHERE id = 1", (err, row) => {
  if (!row) {
    db.run("INSERT INTO user (id, coins) VALUES (1, 5)");
  }
});

// FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// GET COINS
app.get("/coins", (req, res) => {
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    res.json({ coins: row.coins });
  });
});

// SYNC COINS FROM CLIENT
app.post("/synccoins", (req, res) => {
  const { coins } = req.body;

  db.run("UPDATE user SET coins = ? WHERE id = 1", [coins], () => {
    res.json({ success: true });
  });
});

// ADD COINS (CODE SYSTEM)
app.post("/addcoins", (req, res) => {
  const { amount, code } = req.body;

  if (code !== "081508151235180Rss#") {
    return res.json({ error: "WRONG CODE" });
  }

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [amount],
    () => {
      res.json({ success: true });
    }
  );
});

// SAVE PAGE
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body;

  if (!name.endsWith(".orbit") && !name.startsWith("neue_")) {
    return res.json({ error: "INVALID NAME" });
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

// LOAD PAGE
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

// GET ALL PAGES (SYNC)
app.get("/allpages", (req, res) => {
  db.all("SELECT name, content, creator FROM pages", (err, rows) => {
    res.json(rows);
  });
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
  console.log("Orbit FULL SYSTEM RUNNING");
});
