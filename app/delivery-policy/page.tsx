import { Legal } from "@/components/Legal";
import { SITE } from "@/lib/data";

export const metadata = { title: "Shipping & Delivery Policy" };

export default function Delivery() {
  return (
    <Legal title="Shipping & Delivery Policy">
      <p>Softing sells a digital service: placement of a listing on the public leaderboard at softing.online. Nothing is shipped.</p>
      <h2>Delivery</h2>
      <ul>
        <li>Your listing or top-up is delivered <strong>instantly</strong> once the payment provider confirms the payment.</li>
        <li>If you close the payment window early, delivery can take up to a few minutes while we receive confirmation.</li>
        <li>If your listing isn&apos;t visible within 24 hours of a successful payment, email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> and we&apos;ll fix it or refund you.</li>
      </ul>
      <p>The service is available worldwide.</p>
    </Legal>
  );
}
