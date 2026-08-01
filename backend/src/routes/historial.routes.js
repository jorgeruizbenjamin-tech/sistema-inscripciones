import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/historial - kardex completo del estudiante autenticado
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT h.id_historial, h.nota_final, h.estado,
              m.codigo, m.nombre_materia, m.creditos, m.semestre,
              ga.nombre_gestion, ga.fecha_inicio
       FROM historial h
       JOIN materia m ON m.id_materia = h.id_materia
       JOIN gestion_academica ga ON ga.id_gestion = h.id_gestion
       WHERE h.cod_siss = $1
       ORDER BY ga.fecha_inicio, m.nombre_materia`,
      [req.estudiante.cod_siss]
    );

    const totales = rows.reduce(
      (acc, r) => {
        acc.total += 1;
        if (r.estado === "APR") acc.aprobadas += 1;
        if (r.estado === "REP") acc.reprobadas += 1;
        if (r.estado === "ABN") acc.abandonadas += 1;
        return acc;
      },
      { total: 0, aprobadas: 0, reprobadas: 0, abandonadas: 0 }
    );

    const notasValidas = rows.filter((r) => r.nota_final !== null);
    const notasAprobadas = rows.filter((r) => r.estado === "APR" && r.nota_final !== null);
    const promedio = (arr) =>
      arr.length ? arr.reduce((s, r) => s + Number(r.nota_final), 0) / arr.length : 0;

    res.json({
      materias: rows,
      resumen: {
        ...totales,
        promedio_general: Number(promedio(notasValidas).toFixed(2)),
        promedio_aprobadas: Number(promedio(notasAprobadas).toFixed(2)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el historial académico." });
  }
});

export default router;
