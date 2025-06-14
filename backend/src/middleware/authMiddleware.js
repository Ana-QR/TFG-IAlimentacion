const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado." });
  }

  // Permite "Bearer <token>" o solo "<token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Token mal formado o ausente." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjunta info del usuario al request para usar en los controladores
    req.user = { id_usuario: decoded.id_usuario };
    next();
  } catch (err) {
    console.error("Token inválido:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = authenticate;
