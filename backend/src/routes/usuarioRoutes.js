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

// ✅ Obtener perfil del usuario autenticado
router.get("/perfil", authenticate, obtenerPerfil);

// ✅ Actualizar nombre del usuario
router.put("/perfil", authenticate, actualizarPerfil);

// ✅ Cambiar contraseña con la actual
router.put("/cambiar-password", authenticate, cambiarPassword);

// ✅ Recuperar contraseña olvidada (sin iniciar sesión)
router.post("/recuperar-password", recuperarPassword);

// ✅ Generar nueva contraseña desde perfil (requiere estar logueado)
router.post("/generar-password", authenticate, enviarNuevaPasswordPorCorreo);

module.exports = router;
