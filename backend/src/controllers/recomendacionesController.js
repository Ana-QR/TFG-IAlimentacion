const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");
const { OpenAI } = require("openai");
require("dotenv").config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getRecomendaciones = async (req, res) => {
  const userId = req.user?.id_usuario;
  const { id_lista } = req.body;

  if (!userId || !id_lista) {
    return res.status(400).json({ error: "Faltan datos." });
  }

  try {
    const lista = await prisma.listaCompra.findFirst({
      where: { id_lista: parseInt(id_lista), id_usuario: userId },
      include: { detalles: { include: { producto: true } } },
    });

    if (!lista) {
      return res.status(404).json({ error: "Lista no encontrada." });
    }

    const productos = lista.detalles.map((d) => d.producto.nombre);
    const supermercadosPrecio = productos.map(() => "Mercadona");
    const supermercadosNutricion = productos.map(() => "Veritas");

    res.json({ productos, supermercadosPrecio, supermercadosNutricion });
  } catch (err) {
    console.error("Error en getRecomendaciones:", err.message);
    res.status(500).json({ error: "Error al obtener recomendaciones." });
  }
};

const generarRecomendacionesIA = async (req, res) => {
  const { productos, preferencias, modo = "hibrido" } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debes enviar un array de productos." });
  }

  const prompt = `
Tengo la siguiente lista de productos: ${productos.join(", ")}.
Basándote en la ${preferencias}, para cada producto haz lo siguiente:
- Indica el supermercado más adecuado para comprarlo.
- Estima un precio razonable y actual en euros (por ejemplo: 2.35€).
- Justifica brevemente por qué recomiendas ese supermercado.

Devuélvelo estrictamente en formato JSON, sin explicaciones ni adornos:
[
  {
    "producto": "Nombre del producto",
    "supermercado": "Nombre del supermercado",
    "precio": "X.XX€",
    "motivo": "Justificación breve"
  }
]
`.trim();


  const intentarConGemini = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  };

  const intentarConOpenAI = async () => {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return result.choices[0].message.content;
  };

  const limpiarYParsearJSON = (text) => {
    try {
      const limpio = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const start = limpio.indexOf('[');
      const end = limpio.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error("No se encontró JSON válido en la respuesta IA");

      return JSON.parse(limpio.slice(start, end + 1));
    } catch (e) {
      throw new Error("Error al limpiar o parsear la respuesta IA: " + e.message);
    }
  };

  try {
    let textoIA = "";

    if (modo === "gemini" || modo === "hibrido") {
      try {
        textoIA = await intentarConGemini();
      } catch (errGemini) {
        if (modo === "gemini") throw errGemini;
        console.warn("Gemini falló, usando OpenAI:", errGemini.message);
        textoIA = await intentarConOpenAI();
        const recomendacion = limpiarYParsearJSON(textoIA);
        return res.status(200).json({
          recomendacion,
          fallback: true,
          mensaje: "Gemini no respondió. Se ha usado OpenAI como respaldo.",
        });
      }
    } else if (modo === "openai") {
      textoIA = await intentarConOpenAI();
    }

    const recomendacion = limpiarYParsearJSON(textoIA);

    if (!Array.isArray(recomendacion)) {
      throw new Error("La IA no devolvió un array válido.");
    }

    res.status(200).json({ recomendacion });
  } catch (err) {
    console.error("Error generarRecomendacionesIA:", err.message);
    res.status(500).json({ error: err.message || "Error generando recomendaciones IA." });
  }
};

module.exports = { getRecomendaciones, generarRecomendacionesIA };
