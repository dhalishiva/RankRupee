import Link from "next/link";

export const metadata = { title: "Rules" };

export default function Rules() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">Rules</p>
      <h1>The <em>rules</em></h1>
      <ol>
        <li><strong>Rank = total paid in USD.</strong> Higher total, higher rank. Ties go to whoever reached that total first.</li>
        <li><strong>Minimum $1</strong> per payment, including top-ups. INR payments count at the rate shown at checkout.</li>
        <li><strong>One listing per URL.</strong> To climb, top up the listing that already exists.</li>
        <li><strong>Anyone can top up any listing.</strong> Top-ups only ever add to a listing&apos;s total.</li>
        <li>
          <strong>Not allowed:</strong> scams, gambling or betting, adult content, weapons, drugs, illegal products, hate or harassment,
          malware, phishing, impersonation, or links that mislead visitors. We remove these without refund.
        </li>
        <li><strong>Links must work.</strong> Dead or redirected-to-something-else links may be hidden until fixed.</li>
        <li><strong>Listings are final once paid.</strong> Need a correction? Email support and we&apos;ll fix typos and broken links.</li>
      </ol>
      <p>Full details: <Link href="/terms">Terms of Service</Link> and <Link href="/refund-policy">Refund policy</Link>.</p>
    </div>
  );
}
