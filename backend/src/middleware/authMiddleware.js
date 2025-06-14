const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Soporta "Bearer token" o directamente el token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: "Token mal formado o faltante" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir el id del usuario al request
    req.userId = decoded.id_usuario;
    req.user = { id_usuario: decoded.id_usuario };

    next(); // Continua con la siguiente función
  } catch (err) {
    console.error("Error al verificar token:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authenticate;
