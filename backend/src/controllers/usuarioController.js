const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuración segura de nodemailer
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
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: 'Error interno al obtener perfil' });
  }
};

// Actualizar nombre de usuario
const actualizarPerfil = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { nombre } = req.body;

  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { nombre },
    });

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      nombre: usuarioActualizado.nombre,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error interno al actualizar perfil' });
  }
};

// Cambiar contraseña con la actual
const cambiarPassword = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { contraseñaActual, nuevaContraseña } = req.body;

  if (!userId || !contraseñaActual || !nuevaContraseña) {
    return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva.' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!valid) return res.status(400).json({ error: 'La contraseña actual no es correcta' });

    const nuevaHash = await bcrypt.hash(nuevaContraseña, 10);
    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { contraseña: nuevaHash },
    });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno al cambiar contraseña' });
  }
};

// Recuperar contraseña olvidada (sin iniciar sesión)
const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Debes proporcionar un correo electrónico.' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'No existe un usuario con ese correo.' });

    const nuevaPassword = crypto.randomBytes(6).toString("hex"); // 12 caracteres
    const hashed = await bcrypt.hash(nuevaPassword, 10);

    await prisma.usuario.update({
      where: { email },
      data: { contraseña: hashed },
    });

    await transporter.sendMail({
      from: `"IAlimentación" <${process.env.CORREO_REMITENTE}>`,
      to: email,
      subject: 'Recuperación de contraseña - IAlimentación',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Tu nueva contraseña es: <b>${nuevaPassword}</b></p>
        <p>Te recomendamos cambiarla desde tu perfil una vez accedas.</p>
      `,
    });

    res.json({ mensaje: 'Se ha enviado una nueva contraseña a tu correo electrónico.' });
  } catch (err) {
    console.error('Error en recuperación de contraseña:', err.message, err);
    res.status(500).json({ error: 'No se pudo enviar la nueva contraseña. Intenta más tarde.' });
  }
};

// Generar nueva contraseña desde el perfil (requiere login)
const enviarNuevaPasswordPorCorreo = async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nueva = crypto.randomBytes(6).toString("hex");
    const nuevaHash = await bcrypt.hash(nueva, 10);

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: { contraseña: nuevaHash },
    });

    await transporter.sendMail({
      from: `"IAlimentación" <${process.env.CORREO_REMITENTE}>`,
      to: usuario.email,
      subject: 'Nueva contraseña generada - IAlimentación',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Tu nueva contraseña es: <b>${nueva}</b></p>
        <p>Te recomendamos cambiarla desde tu perfil una vez accedas.</p>
      `,
    });

    res.json({ mensaje: 'Nueva contraseña enviada por correo electrónico.' });
  } catch (error) {
    console.error('Error al enviar nueva contraseña:', error.message, error);
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
