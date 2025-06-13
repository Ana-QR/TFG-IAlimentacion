const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  getRecomendaciones,
  generarRecomendacionesIA,
} = require("../controllers/recomendacionesController");

// Ruta base: obtiene supermercados por defecto
router.post("/", authenticate, getRecomendaciones);

// Ruta IA híbrida: puede usar Gemini o OpenAI
router.post("/generar", authenticate, generarRecomendacionesIA);

module.exports = router;
