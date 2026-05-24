import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Fatman Parts. Send us your VIN, year/make/model details, or order information for guaranteed fitment help and expert support.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Fatman Parts",
    "description": "Need fitment help, order support, or a policy question answered? Get in touch with us.",
    "url": "https://fatmanparts.com/contact",
    "mainEntity": {
      "@type": "AutoPartsStore",
      "name": "Fatman Parts",
      "url": "https://fatmanparts.com",
      "logo": "https://fatmanparts.com/brand/fatman-fp-shield.png",
      "image": "https://fatmanparts.com/brand/fatman-primary-horizontal.png",
      "email": "help@fatmanparts.com",
      "telephone": "+1-844-737-1463",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "6779 Beadnell Way",
        "addressLocality": "San Diego",
        "addressRegion": "CA",
        "postalCode": "92117",
        "addressCountry": "US"
      }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
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
            <h2 className="font-black">Phone</h2>
            <Link href="tel:+18447371463" className="mt-2 block text-white/72 hover:text-white">
              (844) 737-1463
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
    </>
  );
}
