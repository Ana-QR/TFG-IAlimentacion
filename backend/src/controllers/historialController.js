// backend/src/controllers/historialController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Añade un producto al historial del usuario
const addProductoToHistorial = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { nombreProducto } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });
  if (!nombreProducto) return res.status(400).json({ error: "El nombre del producto es requerido" });

  try {
    // Verificar si el producto existe o crearlo
    let producto = await prisma.producto.findUnique({
      where: { nombre: nombreProducto },
    });

    if (!producto) {
      producto = await prisma.producto.create({
        data: { nombre: nombreProducto },
      });
    }

    // Verificar si ya está en el historial
    const yaIncluido = await prisma.usuario.findFirst({
      where: {
        id_usuario: userId,
        historial: {
          some: { id_producto: producto.id_producto },
        },
      },
    });

    if (!yaIncluido) {
      await prisma.usuario.update({
        where: { id_usuario: userId },
        data: {
          historial: {
            connect: { id_producto: producto.id_producto },
          },
        },
      });
    }

    res.status(200).json({ mensaje: "Producto añadido al historial" });
  } catch (error) {
    console.error("Error añadiendo al historial:", error);
    res.status(500).json({ error: "Error interno al añadir al historial" });
  }
};

// Elimina un producto del historial del usuario
const removeProductoFromHistorial = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { nombreProducto } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });
  if (!nombreProducto) return res.status(400).json({ error: "El nombre del producto es requerido" });

  try {
    const producto = await prisma.producto.findUnique({
      where: { nombre: nombreProducto },
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await prisma.usuario.update({
      where: { id_usuario: userId },
      data: {
        historial: {
          disconnect: { id_producto: producto.id_producto },
        },
      },
    });

    res.status(200).json({ mensaje: "Producto eliminado del historial" });
  } catch (error) {
    console.error("Error eliminando del historial:", error);
    res.status(500).json({ error: "Error interno al eliminar del historial" });
  }
};

// Obtiene el historial completo del usuario
const getHistorial = async (req, res) => {
  const userId = req.user?.id_usuario;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      include: { historial: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario.historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

module.exports = {
  addProductoToHistorial,
  removeProductoFromHistorial,
  getHistorial,
};
