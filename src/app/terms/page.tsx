export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Terms</h1>
        <p className="mt-4 text-white/75">
          These terms exist to keep things clear. If you have questions about an order,
          fitment, shipping, or returns, contact us and we’ll help.
        </p>
        <div className="mt-8 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Fitment</p>
            <p className="mt-1 text-white/70">
              Fitment guidance is provided to help you choose correctly. When in doubt,
              verify with VIN/trim/engine details before ordering.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Support</p>
            <p className="mt-1 text-white/70">
              We’ll do our best to resolve issues quickly. Provide order number and part
              details to speed things up.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

