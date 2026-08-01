import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { Card, Spinner, Alert } from "../components/UI.jsx";
import { api } from "../api.js";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Horario() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.horario().then(setData).catch((e) => setError(e.message));
  }, []);

  const porDia = DIAS.reduce((acc, d) => {
    acc[d] = (data?.clases || []).filter((c) => c.dia === d);
    return acc;
  }, {});

  return (
    <Layout title="Horario" badge="Semana académica">
      {error && <Alert type="error">{error}</Alert>}
      {!data && !error ? (
        <Spinner />
      ) : data ? (
        data.clases.length === 0 ? (
          <Card style={{ padding: 32, textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
              Aún no tiene materias inscritas para armar su horario. Vaya a{" "}
              <strong>Inscripción</strong> para registrarse en materias.
            </p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {DIAS.map((dia) => (
              <Card key={dia} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{dia}</h3>
                {porDia[dia].length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-faint)" }}>Sin clases</p>
                ) : (
                  porDia[dia].map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-accent-soft)",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{c.codigo} · {c.nombre_materia}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                        {c.hora_inicio?.slice(0, 5)}–{c.hora_final?.slice(0, 5)}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                        Aula {c.nombre_aula} · {c.edificio}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-faint)" }}>
                        {c.nombre_docente} {c.apellido_docente}
                      </p>
                    </div>
                  ))
                )}
              </Card>
            ))}
          </div>
        )
      ) : null}
    </Layout>
  );
}
