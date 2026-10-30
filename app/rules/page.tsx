export const metadata = { title: "Rules" };

export default function Rules() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">Rules</p>
      <h1>The <em>fine print</em></h1>
      <ol>
        <li><strong>Rank = total paid.</strong> Higher total, higher rank. Ties are broken by who paid first.</li>
        <li><strong>Minimum ₹10</strong> per payment, including top-ups.</li>
        <li><strong>No refunds</strong> once a payment is confirmed — being outbid isn&apos;t a refund reason.</li>
        <li><strong>One listing per URL.</strong> Want to climb? Top up the listing you already have.</li>
        <li>
          <strong>We remove listings</strong> for scams, gambling or betting, adult content, illegal products, hate, malware,
          phishing or impersonation — without refund.
        </li>
        <li><strong>Links must work.</strong> Dead links may be hidden until fixed.</li>
        <li>Prices include applicable taxes. GST invoices are issued for every real payment once live payments are on.</li>
      </ol>
      <p className="muted">Demo mode: payments are simulated, so none of this costs anything yet.</p>
    </div>
  );
}
