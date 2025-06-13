const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  generarRecetas,
  generarRecetasDesdeHistorial,
} = require("../controllers/recetasController");

// Ruta directa: el usuario envía productos y puede elegir IA
router.post("/", authenticate, generarRecetas);

// Ruta desde historial (se usa para autogenerar)
router.post("/desde-historial", authenticate, generarRecetasDesdeHistorial);

module.exports = router;
