// backend/src/controllers/iaController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarMensajeIA = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { id_lista } = req.body;

  if (!id_lista || !userId) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista, id_usuario: userId },
      include: { detalles: { include: { producto: true } } }
    });

    if (!lista) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    const productos = lista.detalles.map(d => d.producto.nombre);
    if (!productos.length) {
      return res.status(200).json({ mensaje: 'Tu lista está vacía.' });
    }

    const prompt = `
Soy una inteligencia artificial experta en compras. A continuación te paso una lista de productos del usuario: ${productos.join(', ')}.

Quiero que analices en qué supermercado saldría más rentable hacer la compra en conjunto, teniendo en cuenta todos los productos, no solo uno.

Compara entre supermercados comunes como Mercadona, Carrefour, DIA, Lidl y otros relevantes en España, suponiendo precios promedio actuales.

Ten en cuenta estos criterios por orden de prioridad:
1. Ahorro económico total en el conjunto de la compra.
2. Relación calidad/precio si hay opciones similares.
3. Disponibilidad de productos habituales (si un supermercado no suele tenerlos, descártalo).
4. Ventajas adicionales si están muy igualados (cercanía, productos saludables, promociones...).

Redáctame una sola frase breve, cercana y motivadora recomendando el supermercado más conveniente para esta lista concreta, explicando en qué se basa tu recomendación (por ejemplo: “ahorras X€” o “encuentras todo con mejor calidad”). Evita generalizaciones como “el más barato” si no lo puedes justificar.
`;


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
