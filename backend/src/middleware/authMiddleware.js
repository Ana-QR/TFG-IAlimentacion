const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // ⚠️ Ignorar las peticiones preflight (CORS)
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  // Permite formatos: "Bearer <token>" o solo "<token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Token mal formado o ausente." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir datos del usuario al objeto request
    req.userId = decoded.id_usuario;
    req.user = { id_usuario: decoded.id_usuario };
    next();
  } catch (err) {
    console.error("❌ Error al verificar token:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authenticate;
