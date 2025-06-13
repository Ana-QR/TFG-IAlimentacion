// backend/src/routes/itemsRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const { getItems, addItem, deleteItem, getListaById, addItemToExistingList, updateListaNombre, deleteProducto } = require("../controllers/itemsController");

// Obtener todas las listas del usuario autenticado
router.get("/", authenticate, getItems);

// Obtener una lista específica
router.get("/lista/:id", authenticate, getListaById);

// Añadir item a una nueva lista
router.post("/", authenticate, addItem);

// Añadir item a una lista existente
router.post("/lista/:id/item", authenticate, addItemToExistingList);

// Editar nombre de una lista
router.put("/lista/:id", authenticate, updateListaNombre);

// Eliminar item por ID de detalle
router.delete("/:id", authenticate, deleteItem);

// Eliminar producto del historial (sidebar)
router.delete("/historial/:nombre", authenticate, deleteProducto);

module.exports = router;