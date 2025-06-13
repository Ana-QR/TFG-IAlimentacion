// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Health check opcional
app.get("/", (req, res) => {
  res.send("🌿 API de IAlimentación activa. Puedes usar los endpoints bajo /api/");
});

// Rutas
const authRoutes = require("./src/routes/authRoutes");
const itemsRoutes = require("./src/routes/itemsRoutes");
const historialRoutes = require("./src/routes/historialRoutes");
const recomendacionesRoutes = require("./src/routes/recomendacionesRoutes");
const recetasRoutes = require("./src/routes/recetasRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const iaRoutes = require("./src/routes/iaRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/ia", iaRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
