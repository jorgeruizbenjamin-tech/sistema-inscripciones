import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
// Nota: la validación de CAPTCHA y fecha de nacimiento se muestran en el
// diseño de Figma como factores de verificación adicionales; en esta API
// se valida cod_siss + password, que son los datos que realmente autentican
// al estudiante en el modelo de datos entregado.
router.post("/login", async (req, res) => {
  const { cod_siss, password } = req.body;

  if (!cod_siss || !password) {
    return res.status(400).json({ error: "Código SIS y contraseña son requeridos." });
  }

  try {
    const { rows } = await query(
      `SELECT cod_siss, nombre_estudiante, apellido_estudiante, correo, password_hash
       FROM estudiante WHERE cod_siss = $1`,
      [cod_siss]
    );

    const estudiante = rows[0];
    if (!estudiante) {
      return res.status(401).json({ error: "Código SIS o contraseña incorrectos." });
    }

    const passwordOk = await bcrypt.compare(password, estudiante.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: "Código SIS o contraseña incorrectos." });
    }

    const token = jwt.sign(
      { cod_siss: estudiante.cod_siss, correo: estudiante.correo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      estudiante: {
        cod_siss: estudiante.cod_siss,
        nombre_completo: `${estudiante.nombre_estudiante} ${estudiante.apellido_estudiante}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al iniciar sesión." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT cod_siss, nombre_estudiante, apellido_estudiante, correo
     FROM estudiante WHERE cod_siss = $1`,
    [req.estudiante.cod_siss]
  );
  if (!rows[0]) return res.status(404).json({ error: "Estudiante no encontrado." });
  res.json(rows[0]);
});

export default router;
