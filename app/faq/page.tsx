export const metadata = { title: "FAQ" };

const QA: [string, string][] = [
  ["Is this real?", "The idea is. Right now RankRupee runs in demo mode — payments are simulated and most listings are samples. Live UPI and card payments are coming."],
  ["Where is my demo listing stored?", "Only in this browser. Other visitors won't see it, and clearing site data removes it. Use “Reset demo data” in the footer to start over."],
  ["How much does #1 cost?", "₹1 more than the current #1's total. The claim box on the home page always shows the exact number."],
  ["What's the Today board?", "Only listings claimed or topped up since midnight IST. Much cheaper to top, and it resets every night."],
  ["Do I get a GST invoice?", "Yes, once live payments are enabled every payment gets an invoice."],
  ["Can I edit my listing?", "Editing will come with accounts. For now, a listing is fixed once claimed."],
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
