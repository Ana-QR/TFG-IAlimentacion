const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();

// Configuración del transporte de correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CORREO_REMITENTE,
    pass: process.env.CORREO_CONTRASENA,
  },
});

// Obtener perfil del usuario
const obtenerPerfil = async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: {
        nombre: true,
        email: true,
        fecha_registro: true,
      },
    });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error.message);
    res.status(500).json({ error: 'Error interno al obtener perfil' });
  }
};

// Actualizar nombre
const actualizarPerfil = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { nombre } = req.body;

  if (!userId || !nombre?.trim()) {
    return res.status(400).json({ error: 'Nombre inválido o no autorizado' });
  }

  try {
    const actualizado = await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { nombre },
    });

    res.json({ mensaje: 'Perfil actualizado correctamente', nombre: actualizado.nombre });
  } catch (error) {
    console.error("Error al actualizar perfil:", error.message);
    res.status(500).json({ error: 'Error interno al actualizar perfil' });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { contraseñaActual, nuevaContraseña } = req.body;

  if (!userId || !contraseñaActual || !nuevaContraseña) {
    return res.status(400).json({ error: 'Faltan datos para cambiar la contraseña.' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!esValida) return res.status(400).json({ error: 'La contraseña actual no es correcta' });

    const hash = await bcrypt.hash(nuevaContraseña, 10);
    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { contraseña: hash },
    });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error.message);
    res.status(500).json({ error: 'Error interno al cambiar contraseña' });
  }
};

// Recuperar contraseña (sin login)
const recuperarPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Debes proporcionar un email válido.' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'No existe un usuario con ese correo.' });

    const nuevaPass = crypto.randomBytes(6).toString("hex");
    const hash = await bcrypt.hash(nuevaPass, 10);

    await prisma.usuario.update({
      where: { email },
      data: { contraseña: hash },
    });

    await transporter.sendMail({
      from: `"IAlimentación" <${process.env.CORREO_REMITENTE}>`,
      to: email,
      subject: 'Recuperación de contraseña - IAlimentación',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Tu nueva contraseña es: <b>${nuevaPass}</b></p>
        <p>Te recomendamos cambiarla desde tu perfil una vez accedas.</p>
      `,
    });

    res.json({ mensaje: 'Se ha enviado una nueva contraseña a tu correo electrónico.' });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error.message);
    res.status(500).json({ error: 'No se pudo enviar la nueva contraseña. Intenta más tarde.' });
  }
};

// Nueva contraseña desde perfil (con login)
const enviarNuevaPasswordPorCorreo = async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevaPass = crypto.randomBytes(6).toString("hex");
    const hash = await bcrypt.hash(nuevaPass, 10);

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { contraseña: hash },
    });

    await transporter.sendMail({
      from: `"IAlimentación" <${process.env.CORREO_REMITENTE}>`,
      to: usuario.email,
      subject: 'Nueva contraseña generada - IAlimentación',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Tu nueva contraseña es: <b>${nuevaPass}</b></p>
        <p>Te recomendamos cambiarla desde tu perfil una vez accedas.</p>
      `,
    });

    res.json({ mensaje: 'Nueva contraseña enviada por correo electrónico.' });
  } catch (error) {
    console.error('Error al enviar nueva contraseña:', error.message);
    res.status(500).json({ error: 'No se pudo enviar la nueva contraseña.' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  recuperarPassword,
  enviarNuevaPasswordPorCorreo,
};
