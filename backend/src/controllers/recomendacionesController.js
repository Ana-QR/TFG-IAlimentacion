// recomendacionesController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");
const { OpenAI } = require("openai");
require("dotenv").config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getRecomendaciones = async (req, res) => {
  const userId = req.userId;
  const { id_lista } = req.body;

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
    console.error("Error getRecomendaciones:", err);
    res.status(500).json({ error: "Error al obtener recomendaciones." });
  }
};

const generarRecomendacionesIA = async (req, res) => {
  const { productos, preferencias, modo = "hibrido" } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debes enviar un array de productos." });
  }

  const prompt = `
Tienes esta lista de productos: ${productos.join(", ")}.
Basándote en la ${preferencias}, para cada producto:
- Indica el supermercado ideal.
- Justifica brevemente la elección.
Devuélvelo solo como JSON, sin texto extra:
[
  { "producto": "...", "supermercado": "...", "motivo": "..." },
  ...
]`.trim();

  const intentarConGemini = async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
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
    text = text.replace(/```json/gi, '').replace(/```/g, '');
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error("No se encontró JSON en la respuesta IA");
    return JSON.parse(text.slice(start, end + 1));
  };

  try {
    let textoIA = "";

    if (modo === "gemini" || modo === "hibrido") {
      try {
        textoIA = await intentarConGemini();
      } catch (err) {
        if (modo === "gemini") throw err;
        console.warn("Fallo Gemini, intentando con OpenAI...");
        textoIA = await intentarConOpenAI();
        return res.status(200).json({
          recomendacion: limpiarYParsearJSON(textoIA),
          fallback: true,
          mensaje: "Gemini no respondió. Se usó OpenAI como respaldo."
        });
      }
    } else if (modo === "openai") {
      textoIA = await intentarConOpenAI();
    }

    const recomendacion = limpiarYParsearJSON(textoIA);
    if (!Array.isArray(recomendacion)) throw new Error("La IA no devolvió un array válido");

    res.status(200).json({ recomendacion });
  } catch (err) {
    console.error("Error generarRecomendacionesIA:", err);
    res.status(500).json({ error: err.message || "Error generando recomendaciones IA." });
  }
};

module.exports = { getRecomendaciones, generarRecomendacionesIA };