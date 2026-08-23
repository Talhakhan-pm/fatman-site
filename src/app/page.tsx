import type { Metadata } from "next";
import Link from "next/link";
import { HeroRotatingText } from "@/components/hero-rotating-text";
import { FitmentModuleLazy } from "@/components/fitment-module-lazy";
import { HomepageCompatibleProducts } from "@/components/homepage-compatible-products";
import { HomepageCompatibleCategories } from "@/components/homepage-compatible-categories";
import { getCategories } from "@/lib/catalog-db";
import { catalogRegistry, categoryIconMap } from "@/lib/catalog-registry";
import { socialProfileUrls } from "@/lib/social-links";

export const metadata: Metadata = {
  title: "OEM Parts with Guaranteed Fitment",
  description: "Stop guessing compatibility. Browse and search OEM-verified automotive parts with 18,000+ fitment rules and exact VIN lookups. Fast 24–48 hour U.S. shipping and guaranteed fit.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OEM Parts with Guaranteed Fitment | Fatman Parts",
    description: "Stop guessing compatibility. Browse and search OEM-verified automotive parts with 18,000+ fitment rules and exact VIN lookups. Fast 24–48 hour U.S. shipping and guaranteed fit.",
    url: "https://fatmanparts.com",
    type: "website",
  },
};

const heroRotatingWords = ["ENGINE.", "BRAKES.", "TURBO.", "CLUTCH.", "EXHAUST.", "COILS."];
const steps = [
  {
    num: "01",
    title: "ENTER YOUR RIDE",
    desc: "Year, make, model — or drop your VIN and we decode it instantly.",
    detail: "Covers 99% of domestic & import vehicles from 1990–2026.",
  },
  {
    num: "02",
    title: "WE VERIFY FITMENT",
    desc: "Our system cross-checks 18,000+ OEM fitment rules against your exact build.",
    detail: "Engine, trim, drivetrain — every variable checked.",
  },
  {
    num: "03",
    title: "SHIPS FAST. FITS RIGHT.",
    desc: "Part ships from the nearest U.S. warehouse. Guaranteed match or we make it right.",
    detail: "Free shipping on $99+ orders.",
  },
];
const testimonials = [
  {
    quote: "first time ordering parts online where the part actually fit lol. no returns, no headaches. these guys know their stuff.",
    name: "Marcus T.",
    vehicle: "2019 Silverado 1500",
    rating: 5,
  },
  {
    quote: "ordered a turbo kit on monday, had it by wednesday. fitment was dead on... will be back for suspension next fs",
    name: "Jason R.",
    vehicle: "2021 F-150 EcoBoost",
    rating: 5,
  },
  {
    quote: "vin lookup saved me from ordering the wrong block. saved me like $800 and a weekend of frustration tbh.",
    name: "Dani K.",
    vehicle: "2017 RAM 2500 Cummins",
    rating: 5,
  },
];

function CornerBrackets({ color = "white/20" }: { color?: "white/20" | "white/10" | "white/[0.08]" }) {
  const borderClassMap = {
    "white/20": "border-white/20",
    "white/10": "border-white/10",
    "white/[0.08]": "border-white/[0.08]",
  } as const;
  const c = borderClassMap[color] ?? borderClassMap["white/20"];

  // hidden on phones (sm+) — pure decoration that reads oversized on
  // compact mobile tiles
  return (
    <>
      <span className={`absolute top-0 left-0 hidden h-4 w-4 border-l-2 border-t-2 sm:block ${c}`} />
      <span className={`absolute right-0 top-0 hidden h-4 w-4 border-r-2 border-t-2 sm:block ${c}`} />
      <span className={`absolute bottom-0 left-0 hidden h-4 w-4 border-b-2 border-l-2 sm:block ${c}`} />
      <span className={`absolute bottom-0 right-0 hidden h-4 w-4 border-b-2 border-r-2 sm:block ${c}`} />
    </>
  );
}

function CautionStripe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-2 w-full ${className}`}
      style={{
        background: "repeating-linear-gradient(-45deg, #ff6a00, #ff6a00 10px, var(--caution-dark) 10px, var(--caution-dark) 20px)",
      }}
    />
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2">
      <span className="h-[2px] w-8 bg-[#ff6a00]" />
      <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ff6a00]">{children}</span>
      <span className="h-[2px] w-8 bg-[#ff6a00]" />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-[#ff6a00]" aria-label={`${rating} star rating`}>
      {Array.from({ length: rating }).map((_, index) => (
        <span key={index} className="text-sm">★</span>
      ))}
    </div>
  );
}

export default async function Home() {
  const generatedCategories = await getCategories();
  const categories = generatedCategories.flatMap((category) => {
    const registry = catalogRegistry.find((entry) => entry.slug === category.slug);
    if (!registry || !registry.showOnHomepage) return [];

    return [{
      name: registry.title,
      slug: registry.slug,
      count: `${category.productCount}+`,
      desc: registry.shortDescription,
      Icon: categoryIconMap[registry.icon],
      tag: registry.tag,
    }];
  });



  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "name": "Fatman Parts",
    "image": "https://fatmanparts.com/brand/fatman-primary-horizontal.png",
    "description": "OEM parts with verified fitment, clear pricing, and fast U.S. shipping.",
    "priceRange": "$$",
    "email": "help@fatmanparts.com",
    "telephone": "+1-844-737-1463",
    "sameAs": socialProfileUrls,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "6779 Beadnell Way",
      "addressLocality": "San Diego",
      "addressRegion": "CA",
      "postalCode": "92117",
      "addressCountry": "US"
    },
    "url": "https://fatmanparts.com",
    "logo": "https://fatmanparts.com/brand/fatman-fp-shield.png"
  };

  // No SearchAction: /category ignores ?q=, so advertising it to crawlers
  // pointed sitelinks search at a URL that doesn't actually search.
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fatman Parts",
    "url": "https://fatmanparts.com"
  };

  const faqItems = [
    {
      question: "How does Fatman Parts guarantee fitment?",
      answer: "We match your vehicle's exact year, make, model, and engine against our database of 18,000+ verified OEM fitment rules. If a part you verified with our tools doesn't fit, we will cover the return shipping and make it right immediately.",
    },
    {
      question: "Can I use my VIN to find parts?",
      answer: "Yes. Entering your 17-digit VIN (Vehicle Identification Number) in our lookup tool is the most accurate way to decode your vehicle's trim, options, and engine package. This ensures you only see parts that match your exact vehicle build.",
    },
    {
      question: "Do you sell both new and used auto parts?",
      answer: "Yes, we sell both brand-new and high-quality, inspected used auto parts. Each listing is clearly marked so you know the exact condition and source of the item before adding it to your cart.",
    },
    {
      question: "Are these parts OEM or aftermarket?",
      answer: "We offer both original equipment manufacturer (OEM) parts and premium aftermarket replacements. Every product card is clearly badged with its condition (New/Used) and source (OEM/Aftermarket) so you can make an informed choice.",
    },
    {
      question: "Are the product images exact representations of the parts?",
      answer: "No. Because we manage a massive database of fast-moving inventory coming and going daily, product images are representative. The part number listed on the product card is the exact part you will receive.",
    },
    {
      question: "How long does processing and shipping take?",
      answer: "Orders are processed at our U.S. warehouses within 24 to 48 hours. Shipping typically takes 2 to 5 business days depending on your location. Standard shipping is free on orders over $99.",
    },
    {
      question: "What is your return policy if a part doesn't fit?",
      answer: "We offer a 30-day return policy on all uninstalled, clean parts in their original packaging. If you used our fitment verification tools before buying and the part still does not fit, we cover the return shipping label costs 100%.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <main className="relative overflow-hidden bg-[#111318] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }} />
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0L25 10L20 20L15 10Z'/%3E%3Cpath d='M0 20L5 30L0 40L-5 30Z'/%3E%3Cpath d='M40 20L45 30L40 40L35 30Z'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="absolute right-[-5%] top-[-10%] h-[120%] w-[55%] bg-gradient-to-br from-[#ff6a00] to-[#c2410c] opacity-[0.07]" style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 5% 100%)", transform: "skewX(-6deg)" }} />
        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#ff6a00]/[0.06] blur-[150px]" />
        <CautionStripe className="absolute top-0 left-0 right-0 z-20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-24 sm:px-8 sm:py-24 lg:py-0">
          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-5 sm:space-y-8 lg:col-span-7">
              <div className="inline-flex items-center gap-3 animate-[fadeUp_0.5s_ease-out]">
                <span className="flex h-6 items-center bg-[#ff6a00] px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white" style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}>OEM VERIFIED</span>
                <span className="font-mono text-xs text-white/40 sm:text-sm">18,000+ fitment rules</span>
              </div>
              <h1 className="animate-[fadeUp_0.6s_ease-out_0.1s_both]">
                <span className="block text-4xl font-black leading-[0.9] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">THE RIGHT</span>
                <span className="block text-4xl font-black leading-[0.9] tracking-[-0.03em] text-[#ff6a00] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]"><HeroRotatingText words={heroRotatingWords} intervalMs={2200} /></span>
                <span className="block text-4xl font-black leading-[0.9] tracking-[-0.03em] text-white/20 sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">FIRST TIME.</span>
              </h1>
              <p className="max-w-lg animate-[fadeUp_0.6s_ease-out_0.2s_both] text-base leading-relaxed text-white/50 sm:text-xl">Stop guessing compatibility. Enter your vehicle, get OEM-verified parts that are <span className="font-semibold text-white">guaranteed to fit</span> — shipped from the U.S. in 24–48 hours.</p>
              <div className="flex flex-wrap gap-3 animate-[fadeUp_0.6s_ease-out_0.3s_both] sm:gap-4">
                <Link href="/category" className="group relative inline-flex items-center gap-3 bg-[#ff6a00] px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all duration-200 hover:translate-y-[-2px] hover:bg-[#e55d00] hover:shadow-[0_8px_40px_rgba(255,106,0,0.35)] sm:px-8 sm:py-4 sm:text-lg" style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}>FIND YOUR PART<span className="font-mono transition-transform group-hover:translate-x-1">→</span></Link>
                <Link href="/about" className="inline-flex items-center gap-2 border-2 border-white/20 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white/60 transition-all duration-200 hover:border-[#ff6a00]/60 hover:text-white sm:px-8 sm:py-4 sm:text-lg">How It Works</Link>
              </div>
            </div>
            <div id="fitment-lookup" className="scroll-mt-28 animate-[fadeUp_0.8s_ease-out_0.3s_both] lg:col-span-5">
              <div className="relative border border-white/[0.08] bg-[#1a1d24] p-1"><CautionStripe /><FitmentModuleLazy /><CornerBrackets color="white/10" /></div>
            </div>
          </div>
        </div>
      </section>
      <HomepageCompatibleProducts />
      <HomepageCompatibleCategories />

      <section className="relative overflow-hidden bg-[#15181f] py-12 sm:py-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="absolute left-[-10%] top-12 h-56 w-56 rounded-full bg-[#ff6a00]/[0.08] blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionTag>WHY FATMAN WORKS</SectionTag>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built for people who are tired of <span className="text-[#ff6a00]">guessing at fitment.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:mt-5 sm:text-lg">
                We take the guesswork out of buying auto parts. Pick your vehicle, see verified OEM-matched parts, and get exactly what you need without digging through endless pages of generic catalog clutter.
              </p>
              <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#ff6a00]">Live catalog</p>
                  <p className="mt-2 text-2xl font-black text-white sm:mt-3 sm:text-3xl">{categories.length}</p>
                  <p className="mt-2 text-xs text-white/45 sm:text-sm">Homepage-ready categories already mapped to real catalog sections.</p>
                </div>
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#ff6a00]">Buyer flow</p>
                  <p className="mt-2 text-2xl font-black text-white sm:mt-3 sm:text-3xl">3-step</p>
                  <p className="mt-2 text-xs text-white/45 sm:text-sm">We keep the path tight: vehicle, verified parts, fast checkout.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {steps.map((step) => (
                <div key={step.num} className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-[#1a1d24] p-4 transition hover:border-[#ff6a00]/35 hover:shadow-[0_16px_50px_rgba(255,106,0,0.12)] sm:rounded-[1.75rem] sm:p-7">
                  <span className="pointer-events-none absolute right-4 top-2 font-mono text-5xl font-black tracking-[-0.05em] text-white/[0.03] sm:text-7xl">{step.num}</span>
                  <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ff6a00]/20 bg-[#ff6a00]/10 text-xs font-black text-[#ff6a00] sm:mt-1 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-sm">
                      {step.num}
                    </span>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-wide text-white sm:text-xl">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/55 sm:mt-3 sm:text-base">{step.desc}</p>
                      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30 sm:mt-3 sm:text-sm">{step.detail}</p>
                    </div>
                  </div>
                  <CornerBrackets color="white/[0.08]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#111318] py-12 sm:py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-8 text-center sm:mb-14">
            <SectionTag>SHOP BY CATEGORY</SectionTag>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">What Are You <span className="text-[#ff6a00]">Working On?</span></h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group relative block overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1d24] transition-all duration-300 hover:translate-y-[-3px] hover:border-[#ff6a00]/40 hover:shadow-[0_12px_40px_rgba(255,106,0,0.12)] active:scale-[0.97] sm:rounded-none" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="relative h-24 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] sm:h-48">
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,106,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,106,0,0.3) 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1a1d24] to-transparent opacity-40 category-icon-wash" />
                  <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-8"><div className="h-12 w-12 text-white/[0.35] transition-all duration-500 group-hover:scale-110 group-hover:text-[#ff6a00]/60 sm:h-28 sm:w-28"><cat.Icon /></div></div>
                  {cat.tag && <span className="absolute right-3 top-3 z-10 bg-[#ff6a00] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white" style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}>{cat.tag}</span>}
                  <CornerBrackets color="white/[0.08]" />
                </div>
                <div className="p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[11.5px] font-black uppercase leading-tight tracking-wide text-white transition-colors group-hover:text-[#ff6a00] sm:text-lg">{cat.name}</h3>
                      <p className="mt-1 hidden text-sm text-white/35 sm:block">{cat.desc}</p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/[0.06] bg-white/[0.04] text-sm text-white/30 transition-all duration-300 group-hover:border-[#ff6a00]/30 group-hover:bg-[#ff6a00]/20 group-hover:text-[#ff6a00] sm:h-10 sm:w-10 sm:text-lg">→</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-white/[0.05] pt-2 sm:mt-4 sm:pt-3"><span className="font-mono text-xs font-bold text-[#ff6a00] sm:text-sm">{cat.count}</span><span className="font-mono text-[9px] uppercase tracking-wider text-white/25 sm:text-xs">Live SKUs</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#15181f] py-12 sm:py-28">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,106,0,0.15), transparent 22%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 18%)` }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-8 flex flex-col gap-5 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <SectionTag>REAL BUYER PROOF</SectionTag>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Confidence beats gimmicks.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/50 sm:mt-3 sm:text-lg">
                Don&apos;t just take our word for it. See what real builders, mechanics, and gearheads are saying about their Fatman Parts experience.
              </p>
            </div>
            <div className="hidden rounded-full border border-[#ff6a00]/20 bg-[#ff6a00]/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#ff6a00] sm:block">
              Fast dispatch • Verified fitment • Real support
            </div>
          </div>

          <div className="grid gap-3 sm:gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={`${testimonial.name}-${testimonial.vehicle}`} className="relative rounded-[1.25rem] border border-white/[0.08] bg-[#1a1d24] p-4 sm:rounded-[1.75rem] sm:p-7">
                <CornerBrackets color="white/[0.08]" />
                <div className="relative z-10">
                  <StarRating rating={testimonial.rating} />
                  <p className="mt-3 text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-lg">“{testimonial.quote}”</p>
                  <div className="mt-4 border-t border-white/[0.08] pt-3 sm:mt-6 sm:pt-4">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-white">{testimonial.name}</p>
                    <p className="mt-1 text-xs text-white/40 sm:text-sm">{testimonial.vehicle}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#15181f] py-12 sm:py-28 border-t border-white/[0.04]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8">
          <div className="mb-8 text-center sm:mb-14">
            <SectionTag>FAQ</SectionTag>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Frequently Asked <span className="text-[#ff6a00]">Questions</span>
            </h2>
            <p className="mt-3 text-sm text-white/50 sm:mt-4 sm:text-base">Got questions about compatibility, shipping, or returns? We&apos;ve got answers.</p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#1a1d24] p-4 sm:rounded-[2.5rem] sm:p-10 relative shadow-2xl shadow-black/40 overflow-hidden">
            <CornerBrackets color="white/[0.08]" />
            <div className="divide-y divide-white/[0.08]">
              {faqItems.map((item, idx) => (
                <details key={idx} className="group py-3.5 sm:py-5 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer items-center justify-between text-left font-black uppercase tracking-wide text-white transition-colors duration-300 hover:text-[#ff6a00] [&::-webkit-details-marker]:hidden list-none">
                    <span className="text-[13px] sm:text-lg pr-4">{item.question}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition-transform duration-300 group-open:rotate-180 group-open:border-[#ff6a00]/30 group-open:text-[#ff6a00]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="mt-3 text-[13px] sm:mt-4 sm:text-base leading-relaxed text-white/60">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-orange relative overflow-hidden bg-[#111318] px-4 pb-12 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl border border-[#ff6a00]/20 bg-[#1a1d24] p-5 sm:rounded-[2rem] sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff6a00] via-[#d45500] to-[#9a3412] opacity-95" />
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%)" }} />
            <div className="relative z-10 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-white/80 sm:mb-4">
                  <span className="h-[2px] w-8 bg-white/35" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] sm:text-xs">READY TO PUSH IT FURTHER?</span>
                  <span className="h-[2px] w-8 bg-white/35" />
                </div>
                <h2 className="max-w-3xl text-xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ color: "#ffffff" }}>
                  Ready to lock in your next build? Start browsing our verified catalog.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-lg" style={{ color: "rgba(255,255,255,0.82)" }}>
                  Stop guessing at fitment and start building. Join thousands of other gearheads who trust Fatman Parts for their OEM and performance needs.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/category" className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#111318] transition hover:bg-white/90 sm:w-auto">
                  Browse categories
                </Link>
                <Link href="/fitment-help" className="inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10 sm:w-auto" style={{ color: "#ffffff" }}>
                  Get fitment help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
