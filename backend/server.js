// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://ialimentacion.vercel.app"
];

// ✅ Middleware CORS correcto
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origen no permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Habilita preflight para todas las rutas
app.options("*", cors());

// ✅ Middleware para parsear JSON
app.use(express.json());

// 🌿 Health check
app.get("/", (req, res) => {
  res.send("🌿 API de IAlimentación activa. Puedes usar los endpoints bajo /api/");
});

// 📦 Rutas
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

// 🔁 Servir frontend en producción (solo si no es una ruta /api)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

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
