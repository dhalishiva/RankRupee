export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap page prose legal">
      <p className="eyebrow">Legal</p>
      <h1>{title}</h1>
      <p className="muted small">Last updated: 30 October 2026</p>
      {children}
    </div>
  );
}
