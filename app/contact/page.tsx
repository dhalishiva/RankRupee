import { Legal } from "@/components/Legal";
import { SITE } from "@/lib/data";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <Legal title="Contact us">
      <div className="contact-grid">
        <div className="card">
          <h3>Payments &amp; support</h3>
          <p><a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></p>
          <p className="muted small">Refunds, receipts, listing corrections. Include your payment ID if you have one.</p>
        </div>
        <div className="card">
          <h3>General questions</h3>
          <p><a href={`mailto:${SITE.helloEmail}`}>{SITE.helloEmail}</a></p>
          <p className="muted small">Partnerships, press and everything else.</p>
        </div>
        <div className="card">
          <h3>Business address</h3>
          <p>Kriosity ({SITE.owner})<br />42-A / BLK-S.K. EWS, Sector 66<br />Noida, Gautam Buddha Nagar<br />Uttar Pradesh 201301, India</p>
        </div>
      </div>
      <p className="muted small">We usually reply within 1–2 business days.</p>
    </Legal>
  );
}
