import Link from "next/link";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fatman-accent">Support</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Contact Fatman Parts</h1>
          <p className="mt-4 text-white/72">
            Need fitment help, order support, or a policy question answered? Send the clearest details you have — VIN, part link, order number, photos, or what you’re trying to fix.
          </p>

          <form className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/5 p-5">
            <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Name" />
            <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Email" />
            <input className="w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="VIN (optional, preferred for fitment)" />
            <textarea className="h-32 w-full rounded-lg border border-white/15 bg-fatman-700 px-3 py-2" placeholder="Order number, product link, part number, vehicle details, or what part you need" />
            <button className="rounded-lg bg-fatman-accent px-4 py-2 font-semibold transition hover:bg-fatman-accent-hover">Send</button>
          </form>
        </div>

        <aside className="space-y-4 lg:pt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-black">Email</h2>
            <Link href="mailto:help@fatmanparts.com" className="mt-2 block text-white/72 hover:text-white">
              help@fatmanparts.com
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-black">Business</h2>
            <p className="mt-2 text-white/72">Fatman Parts LLC</p>
            <p className="text-white/72">6779 Beadnell Way</p>
            <p className="text-white/72">San Diego, CA 92117</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-black">Fitment help</h2>
            <p className="mt-2 text-white/72">
              For fastest support, include VIN, year/make/model, trim, engine, and the product you’re considering.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
