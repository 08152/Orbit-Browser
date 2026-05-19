const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(bodyParser.json());
app.use(express.static("uploads"));
app.use(express.static(__dirname));

// STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// DB
const db = new sqlite3.Database("./orbit.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      content TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT,
      filename TEXT,
      type TEXT
    )
  `);

});

// FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* SAVE PAGE */
app.post("/page/save", (req, res) => {
  const { name, content } = req.body;

  db.run(
    "INSERT OR REPLACE INTO pages (name, content) VALUES (?, ?)",
    [name, content],
    () => res.json({ ok: true })
  );
});

/* LOAD PAGE */
app.get("/page/:name", (req, res) => {
  db.get(
    "SELECT * FROM pages WHERE name = ?",
    [req.params.name],
    (err, row) => {
      if (!row) return res.json({ error: "404" });

      db.all(
        "SELECT * FROM files WHERE page = ?",
        [req.params.name],
        (e, files) => {
          res.json({
            content: row.content,
            files
          });
        }
      );
    }
  );
});

/* UPLOAD FILE */
app.post("/upload", upload.single("file"), (req, res) => {

  const { page } = req.body;

  db.run(
    "INSERT INTO files (page, filename, type) VALUES (?, ?, ?)",
    [page, req.file.filename, req.file.mimetype],
    () => res.json({ ok: true })
  );

});

/* LIST FILES */
app.get("/files/:page", (req, res) => {
  db.all(
    "SELECT * FROM files WHERE page = ?",
    [req.params.page],
    (err, rows) => {
      res.json(rows);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Orbit File System Running");
});
