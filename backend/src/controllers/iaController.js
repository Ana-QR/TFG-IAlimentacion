const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarMensajeIA = async (req, res) => {
  const userId = req.userId;
  const { id_lista } = req.body;

  if (!id_lista || !userId) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: id_lista, id_usuario: userId },
      include: { detalles: { include: { producto: true } } }
    });

    const productos = lista.detalles.map(d => d.producto.nombre);
    if (!productos.length) return res.json({ mensaje: 'Tu lista está vacía.' });

    const prompt = `Tengo los siguientes productos en mi lista de la compra: ${productos.join(', ')}. 
    Redáctame una sola frase motivacional, breve y personalizada que me recomiende en qué supermercado hacer la compra, 
    destacando alguna ventaja (ahorro, salud, cercanía, etc), como si fueras una IA experta en compras y que te de el dinero
    que ahorras en el caso de que la ventaja sea el precio.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ mensaje: text.trim() });
  } catch (error) {
    console.error('Error IA recomendación:', error);
    res.status(500).json({ error: 'Error generando recomendación' });
  }
};

module.exports = { generarMensajeIA };
