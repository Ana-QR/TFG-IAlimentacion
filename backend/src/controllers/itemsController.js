const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getItems = async (req, res) => {
  const userId = req.userId;
  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_usuario: userId },
      orderBy: { fecha_creacion: "desc" },
      include: {
        detalles: { include: { producto: true } },
      },
    });
    res.json(lista ? [lista] : []);
  } catch (error) {
    console.error("Error al obtener items:", error);
    res.status(500).json({ error: "Error al obtener items" });
  }
};

const getListaById = async (req, res) => {
  const listaId = parseInt(req.params.id);
  const userId = req.userId;

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: listaId, id_usuario: userId },
      include: {
        detalles: { include: { producto: true } },
      },
    });

    if (!lista) {
      return res.status(404).json({ error: "Lista no encontrada o no pertenece al usuario." });
    }

    res.json(lista);
  } catch (error) {
    console.error("Error al obtener lista por ID:", error);
    res.status(500).json({ error: "Error al obtener lista." });
  }
};

const addItem = async (req, res) => {
  const userId = req.userId;
  const { nombreLista, nombreProducto, cantidad } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Usuario no autenticado." });
  }

  try {
    const producto = await prisma.producto.upsert({
      where: { nombre: nombreProducto },
      update: {},
      create: { nombre: nombreProducto },
    });

    const lista = await prisma.listaCompra.create({
      data: {
        nombre: nombreLista || "Lista sin nombre",
        fecha_creacion: new Date(),
        id_usuario: userId,
        detalles: {
          create: {
            id_producto: producto.id_producto,
            cantidad: cantidad || 1,
          },
        },
      },
      include: {
        detalles: { include: { producto: true } },
      },
    });

    res.status(201).json(lista);
  } catch (error) {
    console.error("Error al añadir item:", error);
    res.status(500).json({ error: "Error al añadir item" });
  }
};

const addItemToExistingList = async (req, res) => {
  const userId = req.userId;
  const listaId = parseInt(req.params.id);
  const { nombreProducto, cantidad } = req.body;

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: listaId, id_usuario: userId },
    });

    if (!lista) {
      return res.status(404).json({ error: "Lista no encontrada o no pertenece al usuario." });
    }

    const producto = await prisma.producto.upsert({
      where: { nombre: nombreProducto },
      update: {},
      create: { nombre: nombreProducto },
    });

    await prisma.detalleListaCompra.create({
      data: {
        id_lista: listaId,
        id_producto: producto.id_producto,
        cantidad: cantidad || 1,
      },
    });

    const listaActualizada = await prisma.listaCompra.findFirst({
      where: { id_lista: listaId },
      include: { detalles: { include: { producto: true } } },
    });

    res.status(201).json(listaActualizada);
  } catch (error) {
    console.error("Error al añadir item:", error);
    res.status(500).json({ error: "Error al añadir item" });
  }
};

const updateListaNombre = async (req, res) => {
  const userId = req.userId;
  const listaId = parseInt(req.params.id);
  const { nuevoNombre } = req.body;

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: listaId, id_usuario: userId },
    });

    if (!lista) {
      return res.status(404).json({ error: "Lista no encontrada o no pertenece al usuario." });
    }

    const listaActualizada = await prisma.listaCompra.update({
      where: { id_lista: listaId },
      data: { nombre: nuevoNombre },
      include: { detalles: { include: { producto: true } } },
    });

    res.json(listaActualizada);
  } catch (error) {
    console.error("Error al actualizar nombre de lista:", error);
    res.status(500).json({ error: "Error al actualizar nombre" });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.detalleListaCompra.delete({
      where: { id_detalle: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar item:", error);
    res.status(500).json({ error: "Error al eliminar item" });
  }
};

const deleteProducto = async (req, res) => {
  const { nombre } = req.params;
  try {
    await prisma.producto.deleteMany({
      where: { nombre },
    });
    res.status(204).end();
  } catch (error) {
    console.error("Error al borrar producto:", error);
    res.status(500).json({ error: "Error al borrar producto" });
  }
};

module.exports = {
  getItems,
  getListaById,
  addItem,
  addItemToExistingList,
  updateListaNombre,
  deleteItem,
  deleteProducto,
};
