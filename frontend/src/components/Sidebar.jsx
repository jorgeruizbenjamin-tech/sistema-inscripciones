import { NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: "home", end: true },
  { to: "/inscripcion", label: "Inscripción", icon: "book" },
  { to: "/kardex", label: "Kardex", icon: "award" },
  { to: "/horario", label: "Horario", icon: "calendar" },
  { to: "/perfil", label: "Perfil", icon: "user" },
];

const ICONS = {
  home: (
    <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z" />
  ),
  book: (
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H16v13H5.5A1.5 1.5 0 0 0 4 17.5v-13Zm12-1.5H16v13" />
  ),
  award: (
    <>
      <circle cx="10" cy="7.5" r="4" />
      <path d="m7 11-1.5 6L10 15l4.5 2L13 11" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" />
    </>
  ),
  user: (
    <>
      <circle cx="10" cy="6.5" r="3.5" />
      <path d="M3.5 17c1-3.5 4-5 6.5-5s5.5 1.5 6.5 5" />
    </>
  ),
  logout: (
    <>
      <path d="M8 17H4.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1H8" />
      <path d="M12.5 13.5 16 10l-3.5-3.5M16 10H7" />
    </>
  ),
};

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { estudiante, logout } = useAuth();

  return (
    <aside
      style={{
        width: 260,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "var(--color-primary)",
              width: 40,
              height: 40,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            UMSS
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "var(--color-text)" }}>SIS Académico</p>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 11, color: "var(--color-text-faint)" }}>
              Gestión de Estudiantes
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                background: isActive ? "var(--color-accent-soft)" : "transparent",
                color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
              })}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            background: "var(--color-muted-soft)",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {estudiante?.nombre_completo?.[0] ?? "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: 13,
                color: "var(--color-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {estudiante?.nombre_completo}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)" }}>
              SIS: {estudiante?.cod_siss}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-muted)",
          }}
        >
          <Icon name="logout" size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
