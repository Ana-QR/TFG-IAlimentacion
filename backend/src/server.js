// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express(); // 💥 Esto tiene que ir antes que cualquier app.use

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/authRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const recomRoutes = require("./routes/recomendacionesRoutes");
const historialRoutes = require("./src/routes/historialRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const iaRoutes = require("./src/routes/iaRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/recomendaciones", recomRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/ia", iaRoutes);

// Arranque del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
