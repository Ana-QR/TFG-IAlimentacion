const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

const cambiarPassword = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { contraseñaActual, nuevaContraseña } = req.body;

  if (!userId || !contraseñaActual || !nuevaContraseña) {
    return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva.' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: userId } });
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

const recuperarPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevaPassword = crypto.randomBytes(6).toString("hex");
    const hashed = await bcrypt.hash(nuevaPassword, 10);

    await prisma.usuario.update({
      where: { email },
      data: { contraseña: hashed },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña - IAlimentación',
      text: `Tu nueva contraseña es: ${nuevaPassword}`,
      html: `<p>Tu nueva contraseña es: <b>${nuevaPassword}</b></p>`,
    });

    res.json({ mensaje: 'Se ha enviado una nueva contraseña a tu correo.' });
  } catch (err) {
    console.error('Error en recuperación de contraseña:', err);
    res.status(500).json({ error: 'No se pudo enviar la nueva contraseña.' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
  recuperarPassword,
};
