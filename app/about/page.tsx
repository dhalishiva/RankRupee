import Link from "next/link";
import { RAZORPAY_LIVE, SITE } from "@/lib/data";

export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">About</p>
      <h1>A leaderboard you <em>can</em> buy</h1>
      <p>
        Every launch site claims it isn&apos;t pay-to-win. Softing is honest about it: the order is decided by money and
        nothing else. No upvote rings, no algorithm, no follower counts.
      </p>
      <p>
        It&apos;s open to makers everywhere. Ranks are counted in US dollars.{" "}
        {RAZORPAY_LIVE
          ? "Buyers in India pay in rupees through Razorpay (UPI, cards, netbanking); everyone else pays through PayPal or card."
          : "Payments go through PayPal, by PayPal balance or debit/credit card."}
      </p>
      <h2>How it works</h2>
      <ol>
        <li>Pick an amount — minimum $1.</li>
        <li>Your rank is the number of listings that have paid the same or more, plus one.</li>
        <li>To pass someone, pay $1 more than their total. Ties go to whoever reached that total first.</li>
        <li>Top up any time to climb. Your listing stays up.</li>
      </ol>
      <h2>Who runs it</h2>
      <p>
        Softing is a product of <a href="https://kriosity.in" target="_blank" rel="noopener">Kriosity</a>, run by {SITE.owner} from
        Noida, India. Questions: <a href={`mailto:${SITE.helloEmail}`}>{SITE.helloEmail}</a>. Help with a payment:{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
      <p><Link href="/claim" className="btn">Claim your rank</Link></p>
    </div>
  );
}
