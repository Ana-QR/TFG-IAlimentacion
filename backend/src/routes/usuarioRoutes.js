const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

const {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  recuperarPassword,
  enviarNuevaPasswordPorCorreo,
} = require("../controllers/usuarioController");

// Obtener y actualizar perfil
router.get("/perfil", authenticate, obtenerPerfil);
router.put("/perfil", authenticate, actualizarPerfil);

// Cambiar contraseña con la actual
router.put("/cambiar-password", authenticate, cambiarPassword);

// Recuperar contraseña si la has olvidado (sin token)
router.post("/recuperar-password", recuperarPassword);

// Generar una nueva contraseña aleatoria desde el perfil (requiere estar logueado)
router.post("/generar-password", authenticate, enviarNuevaPasswordPorCorreo);

module.exports = router;
