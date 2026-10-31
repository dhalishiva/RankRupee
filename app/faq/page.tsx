import { RAZORPAY_LIVE, SITE } from "@/lib/data";

export const metadata = { title: "FAQ" };

const QA: [string, string][] = [
  ["How much does #1 cost?", "$1 more than the current #1's total. The box on the home page always shows the exact number."],
  ...(RAZORPAY_LIVE ? ([["I'm in India. Can I pay in rupees?", "Yes. Choose India at checkout to pay with UPI, cards or netbanking through Razorpay. The rupee price is calculated from the dollar amount at the rate shown at checkout."]] as [string, string][]) : []),
  ["How do I pay?", "With PayPal or a debit/credit card through PayPal, in USD. You don't need a PayPal account to pay by card."],
  ["What name appears on my statement?", RAZORPAY_LIVE ? "Payments are processed by Razorpay or PayPal and may show as Shiva Dhali or Kriosity — the person and company behind Softing." : "Payments are processed by PayPal and may show as Shiva Dhali or Kriosity — the person and company behind Softing."],
  ["What's the Today board?", "It ranks listings only by what they paid today (UTC). It resets every midnight UTC, so it's much cheaper to top."],
  ["How fast does my listing go live?", "Instantly, as soon as the payment is confirmed. If you closed the window mid-payment, it can take a few minutes."],
  ["Can I get a refund if I'm outbid?", "No — being outbid is how the game works. Duplicate or failed charges are always refunded. See the refund policy."],
  ["Can I edit my listing?", `Email ${SITE.supportEmail} from the address you paid with and we'll fix typos or a broken link.`],
  ["Do I get an invoice?", `${RAZORPAY_LIVE ? "Razorpay and PayPal email" : "PayPal emails"} a payment receipt. For a formal invoice, email ${SITE.supportEmail}.`],
];

export default function Faq() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">FAQ</p>
      <h1>Questions, <em>answered</em></h1>
      <div className="faq">
        {QA.map(([q, a]) => (
          <details key={q} className="card">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
