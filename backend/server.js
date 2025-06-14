// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ CORS: permite solicitudes desde frontend (Vercel y local)
const allowedOrigins = [
  'http://localhost:5173',
  'https://ialimentacion.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // importante: 204 evita errores de CORS preflight
  }
  next();
});

// ✅ Middleware para JSON
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

// 🔁 Servir frontend en producción (solo si no es una ruta /api)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  // Redirige todo excepto /api a index.html
  app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path.join(frontendPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("No se encontró index.html");
    }
  });
}

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});
