export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

const ESTADO_STYLES = {
  APR: { bg: "var(--color-success-soft)", color: "var(--color-success)", label: "Aprobado" },
  REP: { bg: "var(--color-danger-soft)", color: "var(--color-danger)", label: "Reprobado" },
  ABN: { bg: "var(--color-warning-soft)", color: "var(--color-warning)", label: "Abandonado" },
  CUR: { bg: "var(--color-accent-soft)", color: "var(--color-accent)", label: "Cursando" },
};

export function EstadoBadge({ estado }) {
  const s = ESTADO_STYLES[estado] || { bg: "var(--color-muted-soft)", color: "var(--color-text-muted)", label: estado };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 8px",
        borderRadius: 6,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-accent)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Alert({ type = "error", children }) {
  const styles = {
    error: { bg: "var(--color-danger-soft)", color: "var(--color-danger)" },
    success: { bg: "var(--color-success-soft)", color: "var(--color-success)" },
  }[type];
  return (
    <div
      style={{
        background: styles.bg,
        color: styles.color,
        borderRadius: 8,
        padding: "12px 16px",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}
