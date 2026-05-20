import Link from "next/link";

export const metadata = {
  title: "Fitment / VIN Help",
};

export default function FitmentHelpPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Fitment / VIN Help</h1>
        <p className="mt-4 text-white/75">
          Our goal is fewer wrong parts. If a product shows “Verify Fitment” or “Fitment
          Unknown”, we can confirm with a little more detail.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Best info to send</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
              <li>VIN (preferred)</li>
              <li>Year / Make / Model</li>
              <li>Trim / Variant and Engine</li>
              <li>Part number (if you have it)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Next step</p>
            <p className="mt-1 text-white/70">
              Message us with your details and the product you’re looking at.
            </p>
            <div className="mt-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-fatman-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-fatman-accent-hover"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

