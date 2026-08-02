import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../src/db.js";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedExtra() {
  const sqlPath = path.join(__dirname, "seed-extra.sql");
  let sql = fs.readFileSync(sqlPath, "utf-8");
  sql = sql.replace(/^\uFEFF/, ""); // quita el BOM si existe (común al guardar desde Windows)

  console.log("Insertando usuarios de prueba adicionales...");
  await pool.query(sql);
  console.log("Usuarios adicionales cargados: 202400120 (Camila) y 202398450 (Diego).");
  await pool.end();
}

seedExtra().catch((err) => {
  console.error("Error al cargar usuarios adicionales:", err);
  process.exit(1);
});
