export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wv-auth-shell">
      {children}
    </div>
  );
}
