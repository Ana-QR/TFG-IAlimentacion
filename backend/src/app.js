//C:\Users\anaqu\Desktop\IAlimentacion\IAlimentacion\backend\src\app.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/authRoutes");
const itemsRoutes = require("./routes/itemsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);

module.exports = app;
