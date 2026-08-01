import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout.jsx";
import { Card, Spinner, Alert } from "../components/UI.jsx";
import { api } from "../api.js";

export default function Inscripcion() {
  const [oferta, setOferta] = useState(null);
  const [misMaterias, setMisMaterias] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);

  const cargar = useCallback(() => {
    Promise.all([api.oferta(), api.misMaterias()])
      .then(([o, m]) => {
        setOferta(o);
        setMisMaterias(m);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function inscribir(id_grupo) {
    setError("");
    setSuccess("");
    setBusyId(id_grupo);
    try {
      await api.inscribir(id_grupo);
      setSuccess("Materia inscrita correctamente.");
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function retirar(id_inscripcion) {
    setError("");
    setSuccess("");
    setBusyId(id_inscripcion);
    try {
      await api.retirar(id_inscripcion);
      setSuccess("Materia retirada correctamente.");
      cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const idsInscritos = new Set((misMaterias?.materias || []).map((m) => m.id_grupo));

  return (
    <Layout title="Inscripción" badge={oferta?.gestion ? `Gestión ${oferta.gestion.nombre_gestion}` : undefined}>
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {misMaterias && (
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
            Materias inscritas ({misMaterias.materias.length})
          </h3>
          {misMaterias.materias.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
              Aún no se ha inscrito en ninguna materia para esta gestión.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {misMaterias.materias.map((m) => (
                <div
                  key={m.id_inscripcion}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--color-accent-soft)",
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                      {m.codigo} · {m.nombre_materia} (Paralelo {m.paralelo})
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                      {m.nombre_docente} {m.apellido_docente} · {m.creditos} créditos
                    </p>
                  </div>
                  <button
                    onClick={() => retirar(m.id_inscripcion)}
                    disabled={busyId === m.id_inscripcion}
                    style={ghostButtonStyle}
                  >
                    {busyId === m.id_inscripcion ? "..." : "Retirar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Oferta académica disponible</h3>
        </div>
        {!oferta && !error ? (
          <Spinner />
        ) : oferta && oferta.oferta.length === 0 ? (
          <p style={{ padding: 20, margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            No hay grupos ofertados en la gestión activa.
          </p>
        ) : oferta ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-muted-soft)" }}>
                {["Materia", "Docente", "Horario", "Cupos", "", ""].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oferta.oferta.map((g) => {
                const yaInscrito = idsInscritos.has(g.id_grupo);
                const sinCupo = g.cupos_disponibles <= 0;
                const bloqueado = !g.cumple_prerrequisitos;
                return (
                  <tr key={g.id_grupo} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td style={tdStyle}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{g.codigo} · {g.nombre_materia}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                        Paralelo {g.paralelo} · {g.creditos} créditos · Sem. {g.semestre}
                      </p>
                    </td>
                    <td style={tdStyle}>{g.nombre_docente} {g.apellido_docente}</td>
                    <td style={tdStyle}>
                      {g.horarios.map((h, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                          {h.dia} {h.hora_inicio?.slice(0, 5)}–{h.hora_final?.slice(0, 5)} · Aula {h.aula}
                        </div>
                      ))}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: sinCupo ? "var(--color-danger)" : "var(--color-text)" }}>
                        {g.cupos_disponibles} / {g.cupo}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {bloqueado && (
                        <span style={{ fontSize: 12, color: "var(--color-danger)" }}>Prerrequisito pendiente</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {yaInscrito ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-success)" }}>Inscrito</span>
                      ) : (
                        <button
                          onClick={() => inscribir(g.id_grupo)}
                          disabled={sinCupo || bloqueado || busyId === g.id_grupo}
                          style={{ ...primaryButtonStyle, opacity: sinCupo || bloqueado ? 0.5 : 1 }}
                        >
                          {busyId === g.id_grupo ? "..." : "Inscribir"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </Card>
    </Layout>
  );
}

const thStyle = { textAlign: "left", padding: "10px 20px", fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" };
const tdStyle = { padding: "12px 20px", fontSize: 13, color: "var(--color-text)", verticalAlign: "top" };

const primaryButtonStyle = {
  background: "var(--color-accent)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 14px",
  fontSize: 12,
  fontWeight: 600,
};

const ghostButtonStyle = {
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-muted)",
};
