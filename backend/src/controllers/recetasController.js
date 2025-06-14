const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
require("dotenv").config();

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generarRecetas = async (req, res) => {
  const { productos, modo = "hibrido" } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: "Debes proporcionar una lista de productos." });
  }

  const prompt = `
Tengo los siguientes productos: ${productos.join(", ")}.
Por favor, genera exactamente 3 recetas fáciles y saludables que los usen.
Devuélvelo en formato JSON puro (sin \`\`\`, sin encabezados ni explicaciones):
[
  {
    "title": "Nombre de la receta",
    "description": "Breve descripción",
    "ingredients": ["ingrediente1", "ingrediente2", ...],
    "steps": ["Paso 1", "Paso 2", ...]
  }
]
`.trim();

  const parseJSON = (text) => {
    try {
      return JSON.parse(text);
    } catch (err) {
      const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error("Respuesta de IA no es un JSON válido.");
    }
  };

  const usarGemini = async () => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const texto = result.response.text().trim();
      return parseJSON(texto);
    } catch (err) {
      throw new Error("Error usando Gemini: " + err.message);
    }
  };

  const usarOpenAI = async () => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      const texto = completion.choices[0].message.content.trim();
      return parseJSON(texto);
    } catch (err) {
      throw new Error("Error usando OpenAI: " + err.message);
    }
  };

  try {
    let recetas = null;
    let modelo = null;
    let aviso = null;

    if (modo === "gemini") {
      recetas = await usarGemini();
      modelo = "gemini";
    } else if (modo === "openai") {
      recetas = await usarOpenAI();
      modelo = "openai";
    } else {
      try {
        recetas = await usarGemini();
        modelo = "gemini";
      } catch (errGemini) {
        console.warn("Gemini falló, usando OpenAI:", errGemini.message);
        recetas = await usarOpenAI();
        modelo = "openai";
        aviso = "Gemini no estaba disponible. Se ha usado OpenAI (GPT-3.5-turbo), que puede implicar costes.";
      }
    }

    if (!Array.isArray(recetas)) {
      return res.status(500).json({ error: "La IA no devolvió un array válido." });
    }

    return res.status(200).json({ recetas, modelo, aviso });
  } catch (error) {
    console.error("Error generando recetas:", error);
    return res.status(500).json({ error: "Error generando recetas.", detalle: error.message });
  }
};

const generarRecetasDesdeHistorial = async (req, res) => {
  const userId = req.user?.id_usuario;

  if (!userId) {
    return res.status(401).json({ error: "No autorizado." });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      include: { historial: true },
    });

    if (!usuario || usuario.historial.length === 0) {
      return res.status(400).json({
        error: "No hay productos en el historial.",
        detalle: "Añade productos a tu lista y guárdalos para generar recetas.",
      });
    }

    const nombresProductos = usuario.historial.map((p) => p.nombre);
    req.body.productos = nombresProductos;

    await generarRecetas(req, res);
  } catch (error) {
    console.error("Error generando recetas desde historial:", error);
    res.status(500).json({ error: "Error generando recetas desde historial." });
  }
};

module.exports = { generarRecetas, generarRecetasDesdeHistorial };
