import Link from "next/link";

export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="wrap page prose">
      <p className="eyebrow">About</p>
      <h1>A leaderboard you <em>can</em> buy</h1>
      <p>
        Every launch site says it isn&apos;t pay-to-win. RankRupee is honest about it: the order is decided by money and
        nothing else. No upvote rings, no algorithm, no follower counts.
      </p>
      <p>
        Built for Indian founders, indie hackers and D2C brands. Prices are in rupees, payments go through UPI and cards, and
        the daily board resets at midnight IST.
      </p>
      <h2>How it works</h2>
      <ol>
        <li>Pick an amount — minimum ₹10.</li>
        <li>Your rank is the number of listings that paid the same or more, plus one.</li>
        <li>To pass someone, pay ₹1 more than their total. Ties go to whoever got there first.</li>
        <li>Top up any time to climb. Your listing stays up for good.</li>
      </ol>
      <p>
        RankRupee is a <a href="https://kriosity.in" target="_blank" rel="noopener">Kriosity</a> project, built in Noida.
      </p>
      <p><Link href="/claim" className="btn">Claim your rank</Link></p>
    </div>
  );
}
