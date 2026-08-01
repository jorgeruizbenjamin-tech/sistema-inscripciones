// En desarrollo local y en docker-compose, "/api" es proxeado al backend
// (ver vite.config.js y nginx.conf). En despliegues donde el frontend y el
// backend no comparten origen (ej. Render, Vercel + Railway), definir
// VITE_API_URL en tiempo de build, ej: VITE_API_URL=https://mi-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("sis_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || "Ocurrió un error al comunicarse con el servidor.");
  }
  return data;
}

export const api = {
  login: (cod_siss, password) => request("/auth/login", { method: "POST", body: { cod_siss, password } }),
  me: () => request("/auth/me"),
  perfil: () => request("/perfil"),
  actualizarPerfil: (payload) => request("/perfil", { method: "PATCH", body: payload }),
  dashboard: () => request("/dashboard"),
  oferta: () => request("/inscripcion/oferta"),
  misMaterias: () => request("/inscripcion/mis-materias"),
  inscribir: (id_grupo) => request("/inscripcion", { method: "POST", body: { id_grupo } }),
  retirar: (id_inscripcion) => request(`/inscripcion/${id_inscripcion}`, { method: "DELETE" }),
  historial: () => request("/historial"),
  horario: () => request("/horario"),
};
