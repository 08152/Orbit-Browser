const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname)); // wichtig für index.html

// DATABASE
const db = new sqlite3.Database("./orbit.db");

// INIT TABLES
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      content TEXT,
      creator TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      coins INTEGER
    )
  `);

  // INIT USER SAFE
  db.get("SELECT coins FROM user WHERE id = 1", (err, row) => {
    if (!row) {
      db.run("INSERT INTO user (id, coins) VALUES (1, 5)");
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
      return res.json({ coins: 5 });
    }
    res.json({ coins: row.coins });
  });
});

// SYNC COINS
app.post("/synccoins", (req, res) => {
  const coins = req.body?.coins;

  if (typeof coins !== "number") {
    return res.json({ error: "INVALID COINS" });
  }

  db.run(
    "UPDATE user SET coins = ? WHERE id = 1",
    [coins],
    () => res.json({ success: true })
  );
});

// ADD COINS
app.post("/addcoins", (req, res) => {
  const amount = Number(req.body?.amount);
  const code = req.body?.code;

  if (code !== "081508151235180Rss#") {
    return res.json({ error: "WRONG CODE" });
  }

  if (!amount || amount <= 0) {
    return res.json({ error: "INVALID AMOUNT" });
  }

  db.run(
    "UPDATE user SET coins = coins + ? WHERE id = 1",
    [amount],
    () => res.json({ success: true })
  );
});

// SAVE PAGE
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body || {};

  if (!name || typeof name !== "string") {
    return res.json({ error: "NO NAME" });
  }

  if (!name.endsWith(".orbit") && !name.startsWith("neue_")) {
    return res.json({ error: "INVALID NAME" });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content, creator) VALUES (?, ?, ?)",
    [name, content || "", creator || "anon"],
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
      if (err || !row) {
        return res.json({ content: "404 NOT FOUND" });
      }
      res.json({ content: row.content });
    }
  );
});

// ALL PAGES
app.get("/allpages", (req, res) => {
  db.all("SELECT name, content, creator FROM pages", (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// EXPLORE
app.get("/explore", (req, res) => {
  db.all("SELECT name, creator FROM pages", (err, rows) => {
    if (err) return res.json([]);
    res.json(rows);
  });
});

// START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Orbit FULL SYSTEM RUNNING on port " + PORT);
});
