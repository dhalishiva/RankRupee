import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">404</p>
      <h1>This rank <em>doesn&apos;t exist</em></h1>
      <p><Link href="/" className="btn">Back to the board</Link></p>
    </div>
  );
}
