const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

let pages = {
  "home.orbit": "<h1>Home</h1><p>Orbit Server läuft</p>"
};

// Seite abrufen
app.get("/page/:name", (req, res) => {
  let name = req.params.name;
  res.json({
    content: pages[name] || "404 Seite nicht gefunden"
  });
});

// Seite erstellen / uploaden
app.post("/upload", (req, res) => {
  let { name, content } = req.body;

  if (!name.endsWith(".orbit")) {
    return res.json({ error: "Name muss auf .orbit enden" });
  }

  pages[name] = content;
  res.json({ success: true });
});

// Seitenliste
app.get("/pages", (req, res) => {
  res.json(Object.keys(pages));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Orbit Server läuft auf Port " + PORT);
});
