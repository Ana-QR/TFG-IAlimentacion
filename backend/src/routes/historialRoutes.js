const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  addProductoToHistorial,
  removeProductoFromHistorial,
  getHistorial,
} = require("../controllers/historialController");

// Cambié 'agregarAlHistorial' por 'addProductoToHistorial' para que coincida con lo que exporta el controlador
router.get("/", authenticate, getHistorial); // asegúrate que exista
router.post("/add", authenticate, addProductoToHistorial);
router.post("/remove", authenticate, removeProductoFromHistorial);
router.get("/historial", authenticate, getHistorial);

module.exports = router;
