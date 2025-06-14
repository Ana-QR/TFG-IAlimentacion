const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

const {
  addProductoToHistorial,
  removeProductoFromHistorial,
  getHistorial,
} = require("../controllers/historialController");

// ✅ Obtener historial del usuario
router.get("/", authenticate, getHistorial);

// ✅ Añadir producto al historial
router.post("/add", authenticate, addProductoToHistorial);

// ✅ Eliminar producto del historial
router.post("/remove", authenticate, removeProductoFromHistorial);

module.exports = router;
