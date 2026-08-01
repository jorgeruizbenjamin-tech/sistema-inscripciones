export default function Topbar({ title, badge }) {
  return (
    <header
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{title}</h1>
        {badge && (
          <span
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--color-success)" }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)" }}>Servidor En Línea</span>
      </div>
    </header>
  );
}
