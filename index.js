const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();

app.use(bodyParser.json({ limit: "20mb" }));
app.use(express.static(__dirname));

/* ================= FILE SYSTEM ================= */
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

/* ================= DB ================= */
const db = new sqlite3.Database("./orbit.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      name TEXT PRIMARY KEY,
      content TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      coins INTEGER
    )
  `);

  db.get("SELECT coins FROM user WHERE id = 1", (e, r) => {
    if (!r) db.run("INSERT INTO user (id, coins) VALUES (1, 0)");
  });

});

/* ================= FRONT ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================= COINS ================= */
app.get("/coins", (req, res) => {
  db.get("SELECT coins FROM user WHERE id = 1", (e, r) => {
    res.json({ coins: r ? r.coins : 0 });
  });
});

app.post("/coins/sync", (req, res) => {
  const { delta } = req.body;
  db.run("UPDATE user SET coins = coins + ? WHERE id = 1", [delta || 0], () => {
    res.json({ ok: true });
  });
});

/* ================= IMAGE UPLOAD ================= */
app.post("/upload/image", (req, res) => {

  const { image } = req.body;

  if (!image) return res.json({ error: "NO IMAGE" });

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");

  const name = "img_" + Date.now() + ".png";
  const filePath = path.join(__dirname, "uploads", name);

  fs.writeFileSync(filePath, base64, "base64");

  res.json({ url: "/uploads/" + name });
});

/* ================= PAGES ================= */
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
    (e, r) => {
      res.json({ content: r ? r.content : "404 NOT FOUND" });
    }
  );
});

app.get("/pages", (req, res) => {
  db.all("SELECT name FROM pages", (e, r) => res.json(r || []));
});

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Orbit running on " + PORT);
});
