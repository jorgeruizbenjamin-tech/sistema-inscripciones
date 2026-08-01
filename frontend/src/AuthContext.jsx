import { createContext, useContext, useState, useCallback } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [estudiante, setEstudiante] = useState(() => {
    const raw = localStorage.getItem("sis_estudiante");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (cod_siss, password) => {
    const data = await api.login(cod_siss, password);
    localStorage.setItem("sis_token", data.token);
    localStorage.setItem("sis_estudiante", JSON.stringify(data.estudiante));
    setEstudiante(data.estudiante);
    return data.estudiante;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sis_token");
    localStorage.removeItem("sis_estudiante");
    setEstudiante(null);
  }, []);

  return (
    <AuthContext.Provider value={{ estudiante, login, logout, isAuthenticated: !!estudiante }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
