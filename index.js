const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

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

// HTML DIREKT IM SERVER
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Orbit Web Network</title>

<style>
body{
  margin:0;
  background:black;
  color:white;
  font-family:Arial;
}

#bar{
  padding:10px;
  background:#0a0a0a;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

input, textarea{
  background:#111;
  border:1px solid #333;
  color:white;
  padding:6px;
}

textarea{
  width:300px;
  height:80px;
}

button{
  background:#222;
  border:1px solid #444;
  color:white;
  padding:6px;
  cursor:pointer;
}

#view{
  padding:20px;
}
</style>
</head>

<body>

<div id="bar">
  <input id="creator" placeholder="creator">
</div>

<div id="bar">
  <input id="open" placeholder="seite.orbit">
  <button onclick="loadPage()">Open</button>
</div>

<div id="bar">
  <input id="pname" placeholder="seite.orbit">
  <textarea id="content" placeholder="HTML"></textarea>
  <button onclick="upload()">Upload</button>
</div>

<div id="bar">
  <button onclick="explore()">Explore</button>
</div>

<div id="view">Orbit Network gestartet</div>

<script>
async function loadPage(){
  let name = document.getElementById("open").value;

  let res = await fetch("/page/" + name);
  let data = await res.json();

  document.getElementById("view").innerHTML =
    data.content;
}

async function upload(){
  let name = document.getElementById("pname").value;
  let content = document.getElementById("content").value;
  let creator = document.getElementById("creator").value;

  let res = await fetch("/upload", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      name,
      content,
      creator
    })
  });

  let data = await res.json();

  document.getElementById("view").innerText =
    data.success ? "Seite gespeichert" : data.error;
}

async function explore(){
  let res = await fetch("/explore");
  let data = await res.json();

  let html = "<h2>Orbit Network</h2>";

  data.forEach(p => {
    html += "<p>" + p.name +
      " (" + p.creator + ")</p>";
  });

  document.getElementById("view").innerHTML = html;
}
</script>

</body>
</html>
  `);
});

// PAGE UPLOAD
app.post("/upload", (req, res) => {
  const { name, content, creator } = req.body;

  if (!name.endsWith(".orbit")) {
    return res.json({
      error:"Nur .orbit erlaubt"
    });
  }

  db.run(
    "INSERT OR REPLACE INTO pages (name, content, creator) VALUES (?, ?, ?)",
    [name, content, creator || "unknown"],
    (err) => {
      if (err) {
        return res.json({
          error:"Speicherfehler"
        });
      }

      res.json({
        success:true
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
          content:"Seite nicht gefunden"
        });
      }

      res.json({
        content:row.content
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

// START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Orbit läuft auf Port " + PORT);
});
