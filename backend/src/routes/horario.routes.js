import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/horario - horario semanal armado a partir de las materias
// inscritas por el estudiante en la gestión activa
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT h.dia, h.hora_inicio, h.hora_final,
              a.nombre_aula, a.edificio,
              m.codigo, m.nombre_materia,
              d.nombre_docente, d.apellido_docente
       FROM inscripcion i
       JOIN grupo g ON g.id_grupo = i.id_grupo
       JOIN gestion_academica ga ON ga.id_gestion = g.id_gestion
       JOIN horario h ON h.id_grupo = g.id_grupo
       JOIN aula a ON a.id_aula = h.id_aula
       JOIN materia m ON m.id_materia = g.id_materia
       JOIN docente d ON d.id_docente = g.id_docente
       WHERE i.cod_siss = $1 AND i.estado = 'inscrito' AND ga.estado = 'activa'
       ORDER BY array_position(ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'], h.dia), h.hora_inicio`,
      [req.estudiante.cod_siss]
    );

    res.json({ clases: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el horario." });
  }
});

export default router;
