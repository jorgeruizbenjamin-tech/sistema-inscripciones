import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { Card, Spinner, Alert } from "../components/UI.jsx";
import { api } from "../api.js";

const ACTIONS = [
  { key: "inscripcion_estado", title: "Estado de Inscripción", desc: "Verifique sus materias inscritas para el periodo activo", cta: "Verificar", to: "/inscripcion" },
  { key: "kardex", title: "Kardex de Calificaciones", desc: "Historial completo de notas y plan de estudios", cta: "Consultar", to: "/kardex" },
  { key: "inscribirse", title: "Inscribirse vía Internet", desc: "Acceda al formulario de inscripción de materias activa", cta: "Ir a Inscripción", to: "/inscripcion" },
  { key: "horario", title: "Horario de Clases", desc: "Visualice su calendario semanal actual", cta: "Ver Horario", to: "/horario" },
  { key: "perfil", title: "Datos de Perfil", desc: "Consulte y actualice su información personal", cta: "Ver Perfil", to: "/perfil" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  const gestionLabel = data?.gestion_activa ? `Gestión Activa ${data.gestion_activa.nombre_gestion}` : "Sin gestión activa";

  return (
    <Layout title="Inicio" badge={data ? gestionLabel : undefined}>
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error ? (
        <Spinner />
      ) : data ? (
        <>
          <Card style={{ padding: 32, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700 }}>
                ¡Bienvenido, {data.estudiante?.nombre_estudiante} {data.estudiante?.apellido_estudiante}!
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                Consulte su avance académico, regístrese en nuevas asignaturas y verifique sus horarios para este
                nuevo ciclo en la Universidad Mayor de San Simón.
              </p>
            </div>
            {data.gestion_activa && (
              <span
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                Gestión {data.gestion_activa.nombre_gestion}
              </span>
            )}
          </Card>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Avance Académico</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <StatCard label="Materias Cursadas" value={data.avance_academico.materias_cursadas} badge="Total" />
                <StatCard label="Aprobadas" value={data.avance_academico.aprobadas} badge="Total" tone="success" />
                <StatCard label="Reprobadas" value={data.avance_academico.reprobadas} badge="Total" tone="danger" />
                <StatCard label="Abandonadas" value={data.avance_academico.abandonadas} badge="Total" tone="warning" />
                <StatCard label="Promedio General" value={data.avance_academico.promedio_general} badge="Promedio" tone="accent" />
                <StatCard label="Promedio Aprobadas" value={data.avance_academico.promedio_aprobadas} badge="Promedio" tone="accent" />
              </div>
            </div>

            <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 12 }}>
              {ACTIONS.map((a) => (
                <Card
                  key={a.key}
                  onClick={() => navigate(a.to)}
                  style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        background: "var(--color-accent-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-accent)",
                        fontWeight: 700,
                      }}
                    >
                      ●
                    </div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{a.title}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.4 }}>{a.desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent)" }}>{a.cta} →</span>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </Layout>
  );
}

const TONES = {
  default: { bg: "var(--color-muted-soft)", color: "var(--color-text-muted)" },
  success: { bg: "var(--color-success-soft)", color: "var(--color-success)" },
  danger: { bg: "var(--color-danger-soft)", color: "var(--color-danger)" },
  warning: { bg: "var(--color-warning-soft)", color: "var(--color-warning)" },
  accent: { bg: "var(--color-accent-soft)", color: "var(--color-accent)" },
};

function StatCard({ label, value, badge, tone = "default" }) {
  const t = TONES[tone];
  return (
    <Card style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{value}</p>
      </div>
      <span style={{ background: t.bg, color: t.color, fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 6 }}>
        {badge}
      </span>
    </Card>
  );
}
