const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  generarRecetas,
  generarRecetasDesdeHistorial,
} = require("../controllers/recetasController");

// ✅ Generar recetas desde productos enviados manualmente
router.post("/", authenticate, generarRecetas);

// ✅ Generar recetas a partir del historial del usuario
router.post("/desde-historial", authenticate, generarRecetasDesdeHistorial);

module.exports = router;
