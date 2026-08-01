import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../src/db.js";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  console.log("Aplicando esquema (schema.sql)...");
  await pool.query(schemaSql);
  console.log("✔ Esquema aplicado correctamente.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("✘ Error al migrar la base de datos:", err);
  process.exit(1);
});
