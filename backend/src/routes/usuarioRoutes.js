const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const { obtenerPerfil, actualizarPerfil, cambiarPassword, enviarNuevaPasswordPorCorreo } = require("../controllers/usuarioController");

router.get("/perfil", authenticate, obtenerPerfil);
router.put("/perfil", authenticate, actualizarPerfil);
router.put("/cambiar-password", authenticate, cambiarPassword);
router.post("/recuperar-password", authenticate, enviarNuevaPasswordPorCorreo);

module.exports = router;
