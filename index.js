const express = require("express");
const app = express();
const path = require("path");

// HTML / CSS / JS aus "public" laden
app.use(express.static("public"));

// Test API (optional)
app.get("/api", (req, res) => {
  res.json({ message: "Server läuft 🚀" });
});

// Start Server (WICHTIG für Render: process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server läuft auf Port " + PORT);
});
