// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

// ✅ CORS correcto para frontend en Vercel (y local opcional)
app.use(cors({
  origin: ['http://localhost:5173', 'https://ialimentacion.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 🌿 Health check
app.get("/", (req, res) => {
  res.send("🌿 API de IAlimentación activa. Puedes usar los endpoints bajo /api/");
});

// 📦 Importar rutas
const authRoutes = require("./src/routes/authRoutes");
const itemsRoutes = require("./src/routes/itemsRoutes");
const historialRoutes = require("./src/routes/historialRoutes");
const recomendacionesRoutes = require("./src/routes/recomendacionesRoutes");
const recetasRoutes = require("./src/routes/recetasRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const iaRoutes = require("./src/routes/iaRoutes");

// 📌 Usar rutas
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/recomendaciones", recomendacionesRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/ia", iaRoutes);

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});
