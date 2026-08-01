import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { Alert } from "../components/UI.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [codSiss, setCodSiss] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(codSiss, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 60,
          top: 60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,58,138,0.10) 0%, rgba(30,58,138,0) 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -60,
          bottom: -60,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0) 70%)",
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 20,
          boxShadow: "0px 12px 12px rgba(15,23,42,0.03)",
          padding: 40,
          width: 460,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "var(--color-primary)",
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            UMSS
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 24, color: "var(--color-text)" }}>SIS Académico</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
              Universidad Mayor de San Simón
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Código SIS">
            <input
              type="text"
              inputMode="numeric"
              placeholder="202500350"
              value={codSiss}
              onChange={(e) => setCodSiss(e.target.value)}
              required
              style={inputStyle}
            />
          </Field>
          <Field label="Contraseña">
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </Field>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: 14,
              fontWeight: 600,
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--color-accent)", textDecoration: "underline", cursor: "pointer" }}>
              ¿Olvidó su contraseña?
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>Ayuda SIS</span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-faint)", textAlign: "center" }}>
          Demo: código SIS <strong>202500350</strong> · contraseña <strong>Umss2026!</strong>
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  color: "var(--color-text)",
  width: "100%",
};
