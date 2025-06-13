const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { registerUser, loginUser, forgotPassword } = require("../controllers/authController");

router.post("/registro", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.id_usuario },
      select: { id_usuario: true, nombre: true, email: true },
    });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

module.exports = router;