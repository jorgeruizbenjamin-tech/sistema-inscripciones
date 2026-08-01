import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const MAX_MATERIAS_POR_GESTION = 7;

async function getGestionActiva() {
  const { rows } = await query(
    `SELECT * FROM gestion_academica WHERE estado = 'activa' ORDER BY fecha_inicio DESC LIMIT 1`
  );
  return rows[0] || null;
}

// GET /api/inscripcion/oferta
// Lista los grupos ofertados en la gestión activa, con cupos disponibles,
// horario, docente y si el estudiante cumple los prerrequisitos.
router.get("/oferta", requireAuth, async (req, res) => {
  try {
    const gestion = await getGestionActiva();
    if (!gestion) return res.json({ gestion: null, oferta: [] });

    const { rows: grupos } = await query(
      `SELECT
         g.id_grupo, g.paralelo, g.cupo,
         m.id_materia, m.codigo, m.nombre_materia, m.creditos, m.semestre,
         d.id_docente, d.nombre_docente, d.apellido_docente,
         COALESCE(insc.total_inscritos, 0) AS inscritos,
         COALESCE(
           json_agg(
             json_build_object('dia', h.dia, 'hora_inicio', h.hora_inicio, 'hora_final', h.hora_final, 'aula', a.nombre_aula)
             ORDER BY h.dia
           ) FILTER (WHERE h.id_horario IS NOT NULL), '[]'
         ) AS horarios
       FROM grupo g
       JOIN materia m ON m.id_materia = g.id_materia
       JOIN docente d ON d.id_docente = g.id_docente
       LEFT JOIN horario h ON h.id_grupo = g.id_grupo
       LEFT JOIN aula a ON a.id_aula = h.id_aula
       LEFT JOIN (
         SELECT id_grupo, COUNT(*) AS total_inscritos
         FROM inscripcion WHERE estado = 'inscrito' GROUP BY id_grupo
       ) insc ON insc.id_grupo = g.id_grupo
       WHERE g.id_gestion = $1
       GROUP BY g.id_grupo, m.id_materia, d.id_docente, insc.total_inscritos
       ORDER BY m.semestre, m.nombre_materia`,
      [gestion.id_gestion]
    );

    // Materias aprobadas por el estudiante (para validar prerrequisitos)
    const { rows: aprobadas } = await query(
      `SELECT id_materia FROM historial WHERE cod_siss = $1 AND estado = 'APR'`,
      [req.estudiante.cod_siss]
    );
    const aprobadasSet = new Set(aprobadas.map((r) => r.id_materia));

    const { rows: prereqs } = await query(`SELECT id_materia, id_materia_requisito FROM prerrequisito`);
    const prereqsPorMateria = prereqs.reduce((acc, p) => {
      (acc[p.id_materia] ||= []).push(p.id_materia_requisito);
      return acc;
    }, {});

    const oferta = grupos.map((g) => {
      const requisitos = prereqsPorMateria[g.id_materia] || [];
      const cumplePrerrequisitos = requisitos.every((idReq) => aprobadasSet.has(idReq));
      return {
        ...g,
        cupos_disponibles: g.cupo - Number(g.inscritos),
        cumple_prerrequisitos: cumplePrerrequisitos,
      };
    });

    res.json({ gestion, oferta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener la oferta académica." });
  }
});

// GET /api/inscripcion/mis-materias - materias inscritas en la gestión activa
router.get("/mis-materias", requireAuth, async (req, res) => {
  try {
    const gestion = await getGestionActiva();
    if (!gestion) return res.json({ gestion: null, materias: [] });

    const { rows } = await query(
      `SELECT i.id_inscripcion, i.fecha_inscripcion, i.estado,
              g.id_grupo, g.paralelo,
              m.codigo, m.nombre_materia, m.creditos,
              d.nombre_docente, d.apellido_docente
       FROM inscripcion i
       JOIN grupo g ON g.id_grupo = i.id_grupo
       JOIN materia m ON m.id_materia = g.id_materia
       JOIN docente d ON d.id_docente = g.id_docente
       WHERE i.cod_siss = $1 AND g.id_gestion = $2 AND i.estado = 'inscrito'
       ORDER BY m.nombre_materia`,
      [req.estudiante.cod_siss, gestion.id_gestion]
    );

    res.json({ gestion, materias: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las materias inscritas." });
  }
});

// POST /api/inscripcion - inscribir a un grupo { id_grupo }
router.post("/", requireAuth, async (req, res) => {
  const { id_grupo } = req.body;
  const cod_siss = req.estudiante.cod_siss;
  if (!id_grupo) return res.status(400).json({ error: "id_grupo es requerido." });

  try {
    const gestion = await getGestionActiva();
    if (!gestion) return res.status(400).json({ error: "No hay una gestión académica activa." });
    if (new Date() > new Date(gestion.fecha_limite_inscripcion)) {
      return res.status(400).json({ error: "El plazo de inscripción para esta gestión ya venció." });
    }

    const { rows: grupoRows } = await query(
      `SELECT g.*, m.id_materia FROM grupo g JOIN materia m ON m.id_materia = g.id_materia WHERE g.id_grupo = $1`,
      [id_grupo]
    );
    const grupo = grupoRows[0];
    if (!grupo) return res.status(404).json({ error: "El grupo no existe." });
    if (grupo.id_gestion !== gestion.id_gestion) {
      return res.status(400).json({ error: "El grupo no pertenece a la gestión activa." });
    }

    // Cupo disponible
    const { rows: cupoRows } = await query(
      `SELECT COUNT(*)::int AS total FROM inscripcion WHERE id_grupo = $1 AND estado = 'inscrito'`,
      [id_grupo]
    );
    if (cupoRows[0].total >= grupo.cupo) {
      return res.status(400).json({ error: "No hay cupos disponibles en este grupo." });
    }

    // Prerrequisitos
    const { rows: reqRows } = await query(
      `SELECT id_materia_requisito FROM prerrequisito WHERE id_materia = $1`,
      [grupo.id_materia]
    );
    if (reqRows.length > 0) {
      const { rows: aprobadas } = await query(
        `SELECT id_materia FROM historial WHERE cod_siss = $1 AND estado = 'APR'`,
        [cod_siss]
      );
      const aprobadasSet = new Set(aprobadas.map((r) => r.id_materia));
      const faltantes = reqRows.filter((r) => !aprobadasSet.has(r.id_materia_requisito));
      if (faltantes.length > 0) {
        return res.status(400).json({ error: "No cumple los prerrequisitos para esta materia." });
      }
    }

    // No duplicar inscripción a la misma materia en la misma gestión
    const { rows: yaInscrito } = await query(
      `SELECT i.id_inscripcion FROM inscripcion i
       JOIN grupo g2 ON g2.id_grupo = i.id_grupo
       WHERE i.cod_siss = $1 AND g2.id_materia = $2 AND g2.id_gestion = $3 AND i.estado = 'inscrito'`,
      [cod_siss, grupo.id_materia, gestion.id_gestion]
    );
    if (yaInscrito.length > 0) {
      return res.status(400).json({ error: "Ya está inscrito en esta materia para la gestión activa." });
    }

    // Límite de materias por gestión
    const { rows: totalActuales } = await query(
      `SELECT COUNT(*)::int AS total FROM inscripcion i
       JOIN grupo g2 ON g2.id_grupo = i.id_grupo
       WHERE i.cod_siss = $1 AND g2.id_gestion = $2 AND i.estado = 'inscrito'`,
      [cod_siss, gestion.id_gestion]
    );
    if (totalActuales[0].total >= MAX_MATERIAS_POR_GESTION) {
      return res.status(400).json({ error: `Alcanzó el máximo de ${MAX_MATERIAS_POR_GESTION} materias para esta gestión.` });
    }

    const { rows: nueva } = await query(
      `INSERT INTO inscripcion (cod_siss, id_grupo, estado) VALUES ($1, $2, 'inscrito') RETURNING *`,
      [cod_siss, id_grupo]
    );

    res.status(201).json(nueva[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar la inscripción." });
  }
});

// DELETE /api/inscripcion/:id - retirar una materia inscrita
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE inscripcion SET estado = 'retirado'
       WHERE id_inscripcion = $1 AND cod_siss = $2 AND estado = 'inscrito'
       RETURNING *`,
      [req.params.id, req.estudiante.cod_siss]
    );
    if (!rows[0]) return res.status(404).json({ error: "Inscripción no encontrada." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al retirar la materia." });
  }
});

export default router;
