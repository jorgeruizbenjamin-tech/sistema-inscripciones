import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado. Inicie sesión nuevamente." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.estudiante = payload; // { cod_siss, correo }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada." });
  }
}
