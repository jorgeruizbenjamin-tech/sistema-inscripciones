import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/dashboard - resumen para las tarjetas de la pantalla de Inicio
router.get("/", requireAuth, async (req, res) => {
  try {
    const cod_siss = req.estudiante.cod_siss;

    const { rows: histRows } = await query(
      `SELECT estado, nota_final FROM historial WHERE cod_siss = $1`,
      [cod_siss]
    );

    const totales = histRows.reduce(
      (acc, r) => {
        acc.total += 1;
        if (r.estado === "APR") acc.aprobadas += 1;
        if (r.estado === "REP") acc.reprobadas += 1;
        if (r.estado === "ABN") acc.abandonadas += 1;
        return acc;
      },
      { total: 0, aprobadas: 0, reprobadas: 0, abandonadas: 0 }
    );

    const notasValidas = histRows.filter((r) => r.nota_final !== null);
    const notasAprobadas = histRows.filter((r) => r.estado === "APR" && r.nota_final !== null);
    const promedio = (arr) =>
      arr.length ? arr.reduce((s, r) => s + Number(r.nota_final), 0) / arr.length : 0;

    const { rows: gestionRows } = await query(
      `SELECT * FROM gestion_academica WHERE estado = 'activa' ORDER BY fecha_inicio DESC LIMIT 1`
    );

    const { rows: estudianteRows } = await query(
      `SELECT nombre_estudiante, apellido_estudiante FROM estudiante WHERE cod_siss = $1`,
      [cod_siss]
    );

    res.json({
      estudiante: estudianteRows[0],
      gestion_activa: gestionRows[0] || null,
      avance_academico: {
        materias_cursadas: totales.total,
        aprobadas: totales.aprobadas,
        reprobadas: totales.reprobadas,
        abandonadas: totales.abandonadas,
        promedio_general: Number(promedio(notasValidas).toFixed(2)),
        promedio_aprobadas: Number(promedio(notasAprobadas).toFixed(2)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el resumen del dashboard." });
  }
});

export default router;
