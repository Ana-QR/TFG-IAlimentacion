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
    // Verificar o crear producto
    let producto = await prisma.producto.findUnique({
      where: { nombre: nombreProducto },
    });

    if (!producto) {
      producto = await prisma.producto.create({
        data: { nombre: nombreProducto },
      });
    }

    // Añadir al historial si no está
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

    res.status(200).json({ message: "Producto añadido al historial" });
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

    res.status(200).json({ message: "Producto eliminado del historial" });
  } catch (error) {
    console.error("Error eliminando del historial:", error);
    res.status(500).json({ error: "Error interno al eliminar del historial" });
  }
};

// Obtiene el historial completo del usuario
// backend/src/controllers/historialController.js
const getHistorial = async (req, res) => {
  try {
    const id_usuario = req.userId;

    if (!id_usuario) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
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
