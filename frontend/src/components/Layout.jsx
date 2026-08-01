import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ title, badge, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={title} badge={badge} />
        <main style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
