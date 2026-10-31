import Link from "next/link";
import { Legal } from "@/components/Legal";
import { RAZORPAY_LIVE, SITE } from "@/lib/data";

export const metadata = { title: "Terms of Service" };

export default function Terms() {
  return (
    <Legal title="Terms of Service">
      <h2>1. Who we are</h2>
      <p>
        Softing (<strong>softing.online</strong>) is a product of <strong>Kriosity</strong>, operated by <strong>{SITE.owner}</strong> as sole
        proprietor, {SITE.address} (&ldquo;Softing&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or paying for a listing you agree to these terms.
      </p>
      <h2>2. The service</h2>
      <p>
        Softing is a public leaderboard of products and websites. Listings are ordered by the total amount paid for them, counted in US
        dollars. You can pay to add a listing or to increase (&ldquo;top up&rdquo;) the total of any existing listing. A payment buys placement on
        the leaderboard at the moment of payment; it does not guarantee any particular rank, traffic, clicks or sales, because other people can
        pay more at any time.
      </p>
      <h2>3. Payments</h2>
      <ul>
        <li>{RAZORPAY_LIVE ? "Buyers in India pay in Indian rupees (INR) through Razorpay. Other buyers pay in US dollars (USD) through PayPal." : "Payments are made in US dollars (USD) through PayPal, using a PayPal balance or a debit/credit card."}</li>
        {RAZORPAY_LIVE && <li>INR amounts are calculated from the USD amount at the conversion rate shown at checkout. Your rank counts the USD amount.</li>}
        <li>Prices are inclusive of applicable taxes. Payment-provider and currency-conversion fees charged by your bank are your responsibility.</li>
        <li>Payments may appear on your statement as <strong>{SITE.owner}</strong> or <strong>Kriosity</strong>.</li>
        <li>We never see or store your full card or bank details; these are handled by {RAZORPAY_LIVE ? "Razorpay or PayPal" : "PayPal"} under their own terms.</li>
      </ul>
      <h2>4. Your listing</h2>
      <p>
        You confirm that you have the right to promote the website you list, and that its name, tagline and description are accurate and do not
        infringe anyone&apos;s rights. You grant us a worldwide, royalty-free licence to display your listing content, the site&apos;s name and
        its favicon on Softing and in promotion of Softing. Listing content is public.
      </p>
      <h2>5. Prohibited content</h2>
      <p>
        Listings must not promote scams, gambling or betting, adult content, weapons, drugs, illegal goods or services, hate or harassment,
        malware, phishing, impersonation or misleading redirects. We may edit, hide or remove any listing that breaks these terms or the{" "}
        <Link href="/rules">Rules</Link>, or that we reasonably believe harms visitors, without refund.
      </p>
      <h2>6. Refunds</h2>
      <p>Refunds are governed by our <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.</p>
      <h2>7. Availability</h2>
      <p>
        We aim to keep Softing online but do not guarantee uninterrupted availability. We may change features, layout or ranking display, as
        long as the order of the all-time leaderboard continues to reflect total paid.
      </p>
      <h2>8. Liability</h2>
      <p>
        Softing is provided &ldquo;as is&rdquo;. We are not responsible for third-party websites linked from listings. To the extent permitted by law,
        our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim.
      </p>
      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Courts at Gautam Buddha Nagar (Noida), Uttar Pradesh have exclusive jurisdiction, without
        affecting any mandatory consumer rights you have where you live.
      </p>
      <h2>10. Contact</h2>
      <p>
        Support: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> · General: <a href={`mailto:${SITE.helloEmail}`}>{SITE.helloEmail}</a>.
        We may update these terms; the date above shows the latest version.
      </p>
    </Legal>
  );
}
