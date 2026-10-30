import { Legal } from "@/components/Legal";
import { SITE } from "@/lib/data";

export const metadata = { title: "Refund & Cancellation Policy" };

export default function Refunds() {
  return (
    <Legal title="Refund & Cancellation Policy">
      <h2>Listings and top-ups</h2>
      <p>
        A payment on Softing goes live on the leaderboard immediately, so it can&apos;t be cancelled once confirmed. Payments are
        non-refundable, including when another listing outbids you.
      </p>
      <h2>When we do refund</h2>
      <ul>
        <li><strong>Duplicate charge</strong> — you were charged twice for the same order.</li>
        <li><strong>Failed listing</strong> — money left your account but no listing or top-up appeared within 24 hours.</li>
        <li><strong>Our error</strong> — a technical fault on our side charged the wrong amount.</li>
      </ul>
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> within 30 days with your payment ID or receipt. Approved refunds go
        back to the original payment method within 5–7 business days (Razorpay) or 3–5 business days (PayPal), depending on your bank.
      </p>
      <h2>Removed listings</h2>
      <p>
        Listings removed for breaking the Rules or Terms are not refunded. If we remove a listing for any other reason, we refund the amount paid
        for it.
      </p>
    </Legal>
  );
}
