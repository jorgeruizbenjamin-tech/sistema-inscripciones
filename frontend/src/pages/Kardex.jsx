import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { Card, Spinner, Alert, EstadoBadge } from "../components/UI.jsx";
import { api } from "../api.js";

export default function Kardex() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.historial().then(setData).catch((e) => setError(e.message));
  }, []);

  const porGestion = data?.materias.reduce((acc, m) => {
    (acc[m.nombre_gestion] ||= []).push(m);
    return acc;
  }, {});

  return (
    <Layout title="Kardex" badge="Historial académico">
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error ? (
        <Spinner />
      ) : data ? (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <ResumenCard label="Materias" value={data.resumen.total} />
            <ResumenCard label="Aprobadas" value={data.resumen.aprobadas} tone="success" />
            <ResumenCard label="Reprobadas" value={data.resumen.reprobadas} tone="danger" />
            <ResumenCard label="Abandonadas" value={data.resumen.abandonadas} tone="warning" />
            <ResumenCard label="Promedio General" value={data.resumen.promedio_general} tone="accent" />
            <ResumenCard label="Promedio Aprobadas" value={data.resumen.promedio_aprobadas} tone="accent" />
          </div>

          {Object.entries(porGestion || {}).map(([gestion, materias]) => (
            <Card key={gestion} style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Gestión {gestion}</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--color-muted-soft)" }}>
                    {["Código", "Materia", "Créditos", "Nota", "Estado"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m) => (
                    <tr key={m.codigo + gestion} style={{ borderTop: "1px solid var(--color-border)" }}>
                      <td style={tdStyle}>{m.codigo}</td>
                      <td style={tdStyle}>{m.nombre_materia}</td>
                      <td style={tdStyle}>{m.creditos}</td>
                      <td style={tdStyle}>{m.nota_final ?? "—"}</td>
                      <td style={tdStyle}><EstadoBadge estado={m.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
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

function ResumenCard({ label, value, tone = "default" }) {
  const t = TONES[tone];
  return (
    <Card style={{ padding: 16, minWidth: 150, flex: "1 1 150px" }}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: t.color }}>{value}</p>
    </Card>
  );
}

const thStyle = { textAlign: "left", padding: "10px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" };
const tdStyle = { padding: "12px 20px", fontSize: 13, color: "var(--color-text)" };
