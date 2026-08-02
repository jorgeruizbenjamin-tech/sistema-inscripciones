import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const useSSL = process.env.PGSSLMODE === "require";

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});

/** Atajo para ejecutar una consulta parametrizada */
export const query = (text, params) => pool.query(text, params);