import { Legal } from "@/components/Legal";
import { SITE } from "@/lib/data";

export const metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <Legal title="Privacy Policy">
      <p>
        This policy explains what Softing, a product of Kriosity operated by {SITE.owner} ({SITE.address}), collects and why. We collect as little
        as we can.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Listing details</strong> you submit — website, name, tagline, description, category and optional X handle. These are public.</li>
        <li><strong>Your email address</strong>, entered at checkout. It is private and used only for receipts, support and fraud prevention.</li>
        <li><strong>Payment records</strong> — amount, currency, time and the order/payment IDs from Razorpay or PayPal. Payment amounts and times are shown publicly against listings; who paid is not.</li>
        <li><strong>Click counts</strong> — when someone clicks a listing we add one to its public counter. We don&apos;t store who clicked.</li>
      </ul>
      <p>We do not collect card numbers, UPI IDs or bank details; Razorpay and PayPal process those under their own privacy policies.</p>
      <h2>What we don&apos;t do</h2>
      <p>No advertising trackers, no cross-site tracking, no selling or renting your data, no marketing emails unless you ask for them.</p>
      <h2>Services we use</h2>
      <ul>
        <li><strong>Vercel</strong> — hosts the website and provides Web Analytics and Speed Insights, which count page views and measure load speed without cookies or personal identifiers.</li>
        <li><strong>Supabase</strong> — stores listings and payment records (EU region).</li>
        <li><strong>Razorpay</strong> (India) and <strong>PayPal</strong> (international) — process payments.</li>
        <li><strong>Google</strong> — favicons of listed websites load from Google&apos;s favicon service, and fonts load from Google Fonts. Your browser contacts Google to fetch them.</li>
      </ul>
      <h2>How long we keep it</h2>
      <p>Payment records are kept as long as required for tax and accounting law (generally up to 8 years in India). Listing content stays while the listing is live.</p>
      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, a correction, or deletion of your email address (where law allows) by writing to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from the address you paid with. If you are in the EU/UK, you may also
        complain to your local data protection authority.
      </p>
      <h2>Cookies</h2>
      <p>Softing doesn&apos;t set tracking cookies. Razorpay and PayPal may set cookies inside their checkout windows.</p>
    </Legal>
  );
}
