import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { pool } from "../src/db.js";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_PASSWORD = "Umss2026!";

async function seed() {
  const seedPath = path.join(__dirname, "seed.sql");
  const seedSql = fs.readFileSync(seedPath, "utf-8");

  console.log("Insertando datos de ejemplo (seed.sql)...");
  await pool.query(seedSql);

  console.log("Generando hash real para la contraseña demo...");
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await pool.query(
    "UPDATE estudiante SET password_hash = $1 WHERE cod_siss = 202500350",
    [hash]
  );

  console.log("✔ Datos de ejemplo cargados.");
  console.log(`  Usuario demo -> Código SIS: 202500350 | Contraseña: ${DEMO_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error("✘ Error al cargar datos de ejemplo:", err);
  process.exit(1);
});
