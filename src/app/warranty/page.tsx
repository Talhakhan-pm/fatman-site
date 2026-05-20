export const metadata = {
  title: "Warranty",
};

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Warranty</h1>
        <p className="mt-4 text-white/75">
          Warranty coverage depends on the product and manufacturer. If something looks
          off, reach out — we’ll guide you through the right next step.
        </p>
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="font-semibold">Need help?</p>
          <p className="mt-1 text-white/70">
            Contact support with your order number, part number, and what you’re seeing.
          </p>
        </div>
      </section>
    </div>
  );
}

