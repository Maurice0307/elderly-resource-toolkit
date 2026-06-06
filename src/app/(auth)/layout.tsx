export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 18px" }}>
      {children}
    </div>
  );
}
