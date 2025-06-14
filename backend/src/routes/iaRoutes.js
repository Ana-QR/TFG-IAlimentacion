const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const { generarMensajeIA } = require("../controllers/iaController");

// ✅ Generar mensaje de recomendación de supermercado con IA
router.post("/mensaje-recomendacion", authenticate, generarMensajeIA);

module.exports = router;
