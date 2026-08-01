import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import perfilRoutes from "./routes/perfil.routes.js";
import inscripcionRoutes from "./routes/inscripcion.routes.js";
import historialRoutes from "./routes/historial.routes.js";
import horarioRoutes from "./routes/horario.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "sis-academico-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/inscripcion", inscripcionRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/horario", horarioRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Manejo centralizado de rutas no encontradas
app.use((req, res) => res.status(404).json({ error: "Recurso no encontrado." }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✔ API SIS Académico escuchando en http://localhost:${PORT}`);
});
