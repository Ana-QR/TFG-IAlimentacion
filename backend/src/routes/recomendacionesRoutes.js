const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  getRecomendaciones,
  generarRecomendacionesIA,
} = require("../controllers/recomendacionesController");

// ✅ Obtener recomendaciones simples (mock o lógica básica)
router.post("/", authenticate, getRecomendaciones);

// ✅ Generar recomendaciones usando IA (Gemini/OpenAI)
router.post("/generar", authenticate, generarRecomendacionesIA);

module.exports = router;
