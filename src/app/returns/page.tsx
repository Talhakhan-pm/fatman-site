export const metadata = {
  title: "Returns",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Returns</h1>
        <p className="mt-4 text-white/75">
          Returns are handled case-by-case depending on the item condition and order
          status. If you think you ordered the wrong part, contact us — we’ll help you
          get to the right fit.
        </p>
        <div className="mt-8 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Start a return</p>
            <p className="mt-1 text-white/70">
              Use the contact page with your order details and what you’re trying to
              achieve.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Fitment first</p>
            <p className="mt-1 text-white/70">
              If you’re unsure, verify fitment (VIN/trim/engine) before ordering — it
              reduces delays and return headaches.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

