export const metadata = {
  title: "Shipping",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-black">Shipping</h1>
        <p className="mt-4 text-white/75">
          We ship from the U.S. and aim to dispatch quickly. Exact rates and delivery
          timelines depend on your address and the items in your cart.
        </p>
        <div className="mt-8 grid gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Tracking</p>
            <p className="mt-1 text-white/70">
              When your order ships, you’ll receive a tracking link.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-semibold">Dispatch</p>
            <p className="mt-1 text-white/70">
              Most in-stock items dispatch fast. If something needs extra handling, we’ll
              email you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

