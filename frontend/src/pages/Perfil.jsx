import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { Card, Spinner, Alert } from "../components/UI.jsx";
import { api } from "../api.js";

export default function Perfil() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ correo: "", telefono: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .perfil()
      .then((d) => {
        setData(d);
        setForm({ correo: d.correo, telefono: d.telefono || "" });
      })
      .catch((e) => setError(e.message));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.actualizarPerfil(form);
      setSuccess("Datos de contacto actualizados correctamente.");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Perfil" badge="Datos del estudiante">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}
      {!data && !error ? (
        <Spinner />
      ) : data ? (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Card style={{ padding: 24, flex: "1 1 320px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Información académica</h3>
            <InfoRow label="Nombre completo" value={`${data.nombre_estudiante} ${data.apellido_estudiante}`} />
            <InfoRow label="Código SIS" value={data.cod_siss} />
            <InfoRow label="CI" value={data.ci} />
            <InfoRow label="Carrera" value={`${data.nombre_carrera} (${data.codigo_carrera})`} />
            <InfoRow label="Facultad" value={`${data.nombre_facultad} (${data.sigla_facultad})`} />
            <InfoRow label="Duración de la carrera" value={`${data.duracion_semestres} semestres`} />
          </Card>

          <Card style={{ padding: 24, flex: "1 1 320px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Estado de cuenta</h3>
            <InfoRow label="Matrícula gestión activa" value={data.estado_cuenta.matricula_gestion_activa} />
            <InfoRow label="Derecho a examen de grado" value={data.estado_cuenta.derecho_examen_grado} />
            <InfoRow label="Deuda biblioteca" value={data.estado_cuenta.deuda_biblioteca} />
          </Card>

          <Card style={{ padding: 24, flex: "1 1 320px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Datos de contacto</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Correo electrónico">
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
                  style={inputStyle}
                  required
                />
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  style={inputStyle}
                />
              </Field>
              <button type="submit" disabled={saving} style={primaryButtonStyle}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </Card>
        </div>
      ) : null}
    </Layout>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
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
};

const primaryButtonStyle = {
  background: "var(--color-accent)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  fontWeight: 600,
};
