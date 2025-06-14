const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Obtener la lista más reciente del usuario
const getItems = async (req, res) => {
  const userId = req.user?.id_usuario;
  if (!userId) return res.status(401).json({ error: "No autorizado" });

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_usuario: userId },
      orderBy: { fecha_creacion: "desc" },
      include: {
        detalles: {
          include: { producto: true },
          orderBy: { id_detalle: "asc" }
        }
      },
    });

    res.json(lista ? [lista] : []);
  } catch (error) {
    console.error("Error al obtener items:", error);
    res.status(500).json({ error: "Error al obtener items" });
  }
};

// Obtener una lista por su ID
const getListaById = async (req, res) => {
  const userId = req.user?.id_usuario;
  const listaId = parseInt(req.params.id);

  if (!userId) return res.status(401).json({ error: "No autorizado" });

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: listaId, id_usuario: userId },
      include: {
        detalles: {
          include: { producto: true },
          orderBy: { id_detalle: "asc" }
        }
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

// Crear una nueva lista con un item
const addItem = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { nombreLista, nombreProducto, cantidad } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });

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
            completed: false,
          },
        },
      },
      include: { detalles: { include: { producto: true } } },
    });

    res.status(201).json(lista);
  } catch (error) {
    console.error("Error al añadir item:", error);
    res.status(500).json({ error: "Error al añadir item" });
  }
};

// Añadir un item a una lista existente
const addItemToExistingList = async (req, res) => {
  const userId = req.user?.id_usuario;
  const listaId = parseInt(req.params.id);
  const { nombreProducto, cantidad } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });

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
        completed: false,
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

// Actualizar el nombre de una lista
const updateListaNombre = async (req, res) => {
  const userId = req.user?.id_usuario;
  const listaId = parseInt(req.params.id);
  const { nuevoNombre } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });

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

// Eliminar un item (detalle) de una lista
const deleteItem = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.detalleListaCompra.delete({ where: { id_detalle: id } });
    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar item:", error);
    res.status(500).json({ error: "Error al eliminar item" });
  }
};

// Eliminar un producto completamente
const deleteProducto = async (req, res) => {
  const { nombre } = req.params;
  try {
    await prisma.producto.deleteMany({ where: { nombre } });
    res.status(204).end();
  } catch (error) {
    console.error("Error al borrar producto:", error);
    res.status(500).json({ error: "Error al borrar producto" });
  }
};

// Cambiar estado completado
const toggleCompleted = async (req, res) => {
  const userId = req.user?.id_usuario;
  const detalleId = parseInt(req.params.id);
  const { completed } = req.body;

  if (!userId) return res.status(401).json({ error: "No autorizado" });

  try {
    const detalle = await prisma.detalleListaCompra.findUnique({
      where: { id_detalle: detalleId },
      include: { lista: true },
    });

    if (!detalle || detalle.lista.id_usuario !== userId) {
      return res.status(404).json({ error: "Item no encontrado o no autorizado." });
    }

    const actualizado = await prisma.detalleListaCompra.update({
      where: { id_detalle: detalleId },
      data: { completed },
    });

    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar estado del item" });
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
  toggleCompleted,
};