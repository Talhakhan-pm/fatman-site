import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-fatman-900 text-white pt-28 lg:pt-32">
      <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-12 sm:pb-16 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fatman-accent">Support</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Contact Fatman Parts</h1>
          <p className="mt-4 text-white/72">
            Need fitment help, order support, or a policy question answered? Send the clearest details you have — VIN, part link, order number, photos, or what you’re trying to fix.
          </p>

          <ContactForm />
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
