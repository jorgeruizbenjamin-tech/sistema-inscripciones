import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/perfil
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT e.cod_siss, e.nombre_estudiante, e.apellido_estudiante, e.ci,
              e.correo, e.telefono, e.fecha_nacimiento,
              c.nombre_carrera, c.codigo_carrera, c.duracion_semestres,
              f.nombre_facultad, f.sigla_facultad
       FROM estudiante e
       JOIN carrera c ON c.id_carrera = e.id_carrera
       JOIN facultad f ON f.id_facultad = c.id_facultad
       WHERE e.cod_siss = $1`,
      [req.estudiante.cod_siss]
    );

    if (!rows[0]) return res.status(404).json({ error: "Estudiante no encontrado." });

    // Nota: los campos de estado de cuenta (matrícula, examen de grado,
    // deuda de biblioteca) no forman parte del modelo de datos entregado.
    // Se devuelven como valores de ejemplo hasta integrar los módulos
    // de tesorería / biblioteca correspondientes.
    res.json({
      ...rows[0],
      estado_cuenta: {
        matricula_gestion_activa: "PAGADO",
        derecho_examen_grado: "HABILITADO",
        deuda_biblioteca: "SIN DEUDAS",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el perfil." });
  }
});

// PATCH /api/perfil - editar datos de contacto
router.patch("/", requireAuth, async (req, res) => {
  const { correo, telefono } = req.body;
  try {
    const { rows } = await query(
      `UPDATE estudiante SET correo = COALESCE($1, correo), telefono = COALESCE($2, telefono)
       WHERE cod_siss = $3
       RETURNING cod_siss, correo, telefono`,
      [correo, telefono, req.estudiante.cod_siss]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar datos de contacto." });
  }
});

export default router;
