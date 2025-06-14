const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        email,
        contraseña: hashedPassword,
        fecha_registro: new Date(),
      },
    });

    const token = jwt.sign({ id_usuario: newUser.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      user: { id_usuario: newUser.id_usuario, nombre: newUser.nombre, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
      select: { id_usuario: true, nombre: true, contraseña: true },
    });

    if (!user || !(await bcrypt.compare(password, user.contraseña))) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ user: { id_usuario: user.id_usuario, nombre: user.nombre }, token });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "El email es obligatorio." });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: "No se encontró una cuenta con ese correo." });

    const nuevaContraseña = crypto.randomBytes(6).toString("hex");
    const hashed = await bcrypt.hash(nuevaContraseña, 10);

    await prisma.usuario.update({
      where: { email },
      data: { contraseña: hashed },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO_REMITENTE,
        pass: process.env.CORREO_CONTRASENA,
      },
    });

    await transporter.sendMail({
      from: '"IAlimentación" <no-reply@ialimentacion.com>',
      to: email,
      subject: "Recuperación de contraseña - IAlimentación",
      text: `Tu nueva contraseña es: ${nuevaContraseña}\nPor seguridad, cámbiala después de iniciar sesión.`,
    });

    return res.json({ mensaje: "Se ha enviado una nueva contraseña a tu correo." });
  } catch (error) {
    console.error("Error al enviar nueva contraseña:", error);
    return res.status(500).json({ error: "Error al recuperar la contraseña." });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
