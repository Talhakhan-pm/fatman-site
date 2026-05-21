import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout canceled | Fatman Parts",
  description: "Return to your Fatman Parts cart.",
};

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-white/12 bg-white/[0.055] p-8 shadow-2xl shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fatman-accent">Checkout canceled</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">No charge was completed.</h1>
          <p className="mt-3 text-white/70">
            Your cart is still saved on this device. You can review parts, adjust quantity, or restart secure checkout.
          </p>
          {params.order && (
            <p className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/60">
              Pending order reference: <span className="font-bold text-white">{params.order}</span>
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cart" className="rounded-xl bg-fatman-accent px-5 py-3 text-sm font-black text-fatman-900 hover:bg-fatman-accent-hover">
              Back to cart
            </Link>
            <Link href="/category" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white/85 hover:bg-white/10">
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
