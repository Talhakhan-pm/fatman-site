/**
 * Homepage Test Variant — Conversion-First, Industrial-Brutalist Aesthetic
 *
 * Frontend-Design Skill Applied:
 *   1. Design Thinking: industrial/brutalist tone, command-line fitment UX,
 *      diagonal section breaks, oversized typography, noise textures
 *   2. Typography: Geist Mono for command elements, Geist Sans bold for headings
 *   3. Color: fatman-accent (orange) as dominant punch on dark slate
 *   4. Motion: CSS-only staggered reveals, hover state surprises
 *   5. Spatial: Asymmetric hero, clip-path diagonals, grid-breaking stats
 *   6. Backgrounds: Noise grain overlay, gradient meshes, layered transparencies
 */

import Link from "next/link";

/* ───────────────────────── static data ───────────────────────── */

const categories = [
  { name: "Engine", icon: "⚙️", count: "1,200+", href: "/category/engine" },
  { name: "Brakes", icon: "🔴", count: "800+", href: "/category/brakes" },
  { name: "Suspension", icon: "🔧", count: "600+", href: "/category/suspension" },
  { name: "Electrical", icon: "⚡", count: "950+", href: "/category/electrical" },
  { name: "Exhaust", icon: "💨", count: "400+", href: "/category/exhaust" },
  { name: "Transmission", icon: "🔩", count: "550+", href: "/category/transmission" },
];

const trustItems = [
  { stat: "99.4%", label: "Fitment accuracy" },
  { stat: "24–48h", label: "Ships from U.S." },
  { stat: "30-Day", label: "No-hassle returns" },
  { stat: "Real", label: "Human support" },
];

const steps = [
  {
    num: "01",
    command: "$ enter_vehicle",
    title: "Enter Your Vehicle",
    desc: "Year, make, model — or drop a VIN. We decode it instantly.",
  },
  {
    num: "02",
    command: "$ verify_fitment",
    title: "We Cross-Check Fitment",
    desc: "18,000+ OEM fitment rules matched against your exact build.",
  },
  {
    num: "03",
    command: "$ ship_fast",
    title: "Ships Fast. Fits Right.",
    desc: "Out the door in 24–48h. Guaranteed match or we make it right.",
  },
];

const testimonials = [
  {
    quote:
      "First time ordering auto parts online where the part actually fit. No returns, no headaches.",
    name: "Marcus T.",
    vehicle: "2019 Silverado 1500",
    rating: 5,
  },
  {
    quote:
      "Ordered a turbo kit on Monday, had it by Wednesday. Fitment was dead-on.",
    name: "Jason R.",
    vehicle: "2021 F-150 EcoBoost",
    rating: 5,
  },
  {
    quote:
      "Their VIN lookup saved me from ordering the wrong engine block. These guys know what they're doing.",
    name: "Dani K.",
    vehicle: "2017 RAM 2500 Cummins",
    rating: 5,
  },
];

const proofStats = [
  { value: "5,200+", label: "OEM SKUs" },
  { value: "18K+", label: "Fitment Rules" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "12K+", label: "Orders Shipped" },
];

/* ───────────────────────── page ───────────────────────── */

export default function HomepageTest() {
  return (
    <main className="relative overflow-hidden">
      {/* ── Noise Grain Overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ══════════════════════════════════════════════════════
          HERO — Asymmetric, oversized type, command-style CTA
         ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-fatman-900">
        {/* Diagonal accent slash */}
        <div
          className="absolute top-0 right-0 w-1/3 h-full bg-fatman-accent/5"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }}
        />

        {/* Grid lines decorative */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-5 gap-12 items-center">
          {/* Left — Copy */}
          <div className="lg:col-span-3 space-y-8">
            <div
              className="inline-flex items-center gap-2 bg-fatman-accent/10 border border-fatman-accent/30 rounded-full px-4 py-1.5 text-fatman-accent text-sm font-mono tracking-wide animate-[fadeUp_0.6s_ease-out]"
            >
              <span className="w-2 h-2 rounded-full bg-fatman-accent animate-pulse" />
              OEM PARTS · VERIFIED FITMENT
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight animate-[fadeUp_0.6s_ease-out_0.1s_both]"
            >
              THE PART
              <br />
              <span className="text-fatman-accent">THAT FITS.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed font-light animate-[fadeUp_0.6s_ease-out_0.2s_both]">
              Stop guessing. Enter your vehicle, get the exact OEM part —
              verified against 18,000+ fitment rules. Ships in 24–48h.
            </p>

            <div className="flex flex-wrap gap-4 animate-[fadeUp_0.6s_ease-out_0.3s_both]">
              <Link
                href="/category"
                className="group relative inline-flex items-center gap-3 bg-fatman-accent hover:bg-fatman-accent-hover text-white font-bold text-lg px-8 py-4 rounded-lg transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(234,88,12,0.3)]"
              >
                FIND YOUR PART
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium text-lg px-8 py-4 rounded-lg transition-all duration-200"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* Right — Fitment Command Card */}
          <div className="lg:col-span-2 animate-[fadeUp_0.8s_ease-out_0.4s_both]">
            <div className="bg-fatman-700/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
              {/* Terminal header */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-fatman-danger/80" />
                <div className="w-3 h-3 rounded-full bg-fatman-warning/80" />
                <div className="w-3 h-3 rounded-full bg-fatman-success/80" />
                <span className="ml-2 text-xs font-mono text-white/40">
                  fitment_lookup.sh
                </span>
              </div>

              {/* Fake command interface */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2 text-white/50">
                  <span className="text-fatman-accent">$</span>
                  <span>select_year</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">
                    2021
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <span className="text-fatman-accent">$</span>
                  <span>select_make</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">
                    Ford
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <span className="text-fatman-accent">$</span>
                  <span>select_model</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">
                    F-150
                  </span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="text-fatman-success text-xs">
                  ✓ 847 verified parts found for 2021 Ford F-150
                </div>
              </div>

              {/* VIN alternative */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-white/40 mb-2 font-mono">
                  — OR PASTE VIN —
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/30 text-sm font-mono">
                    1FTFW1E87MFA00000
                  </div>
                  <button className="bg-fatman-accent hover:bg-fatman-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">
                    GO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom diagonal cut */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-fatman-900"
          style={{
            clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(to right, #0b1220, #1e293b)",
          }}
        />
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST / RISK-REVERSAL STRIP
         ══════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-r from-fatman-900 to-fatman-700 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 group"
              >
                <span className="text-2xl sm:text-3xl font-black text-fatman-accent font-mono tabular-nums">
                  {item.stat}
                </span>
                <span className="text-sm text-white/50 leading-tight group-hover:text-white/70 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORY PATHS — High-Intent Navigation
         ══════════════════════════════════════════════════════ */}
      <section className="relative bg-fatman-900 py-20 sm:py-28">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-fatman-accent/[0.03] blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="text-fatman-accent font-mono text-sm tracking-widest uppercase mb-2">
                {"//"} CATEGORIES
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                What Are You Working On?
              </h2>
            </div>
            <Link
              href="/category"
              className="text-white/50 hover:text-fatman-accent transition-colors text-sm font-mono"
            >
              View all categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-fatman-accent/30 rounded-xl p-6 sm:p-8 transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <span className="text-3xl sm:text-4xl mb-4 block">{cat.icon}</span>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-fatman-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="text-white/40 text-sm font-mono mt-1">
                  {cat.count} parts
                </p>
                <span className="absolute top-6 right-6 text-white/10 group-hover:text-fatman-accent/40 text-2xl transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3-STEP PROCESS — Command-Line Aesthetic
         ══════════════════════════════════════════════════════ */}
      <section className="relative bg-fatman-700/40 py-20 sm:py-28 overflow-hidden">
        {/* Diagonal top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-16 bg-fatman-900"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 100%)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-fatman-accent font-mono text-sm tracking-widest uppercase mb-2">
              {"//"} HOW IT WORKS
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Three Commands.<br />
              <span className="text-fatman-accent">Zero Guesswork.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="group relative bg-fatman-900/80 border border-white/[0.06] rounded-xl p-8 hover:border-fatman-accent/20 transition-all duration-300"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Step number */}
                <div className="text-6xl sm:text-7xl font-black text-white/[0.04] absolute top-4 right-4 leading-none select-none">
                  {step.num}
                </div>

                <p className="font-mono text-fatman-accent text-sm mb-4">
                  {step.command}
                </p>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {step.desc}
                </p>

                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PROOF / STATS BAR
         ══════════════════════════════════════════════════════ */}
      <section className="bg-fatman-900 py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {proofStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tabular-nums font-mono leading-none">
                  {stat.value}
                </p>
                <p className="text-white/40 text-sm mt-2 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS / SOCIAL PROOF SHELL
         ══════════════════════════════════════════════════════ */}
      <section className="relative bg-fatman-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-fatman-accent font-mono text-sm tracking-widest uppercase mb-2">
              {"//"} PROOF
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Don&apos;t Take Our Word For It
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-8 hover:border-fatman-accent/20 transition-all duration-300 hover:translate-y-[-2px]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <span key={si} className="text-fatman-accent text-sm">
                      ★
                    </span>
                  ))}
                </div>

                <blockquote className="text-white/80 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs font-mono">
                      {t.vehicle}
                    </p>
                  </div>
                  <span className="text-white/10 text-2xl select-none">✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA — Full-Width Conversion Block
         ══════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-fatman-accent to-fatman-accent-hover py-20 sm:py-24 overflow-hidden">
        {/* Geometric decoration */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 border border-white/10 rounded-full"
        />
        <div
          className="absolute -bottom-10 -left-10 w-60 h-60 border border-white/10 rounded-full"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Ready to Find the Right Part?
          </h2>
          <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Enter your vehicle details and get verified OEM parts that fit — guaranteed. Free shipping on orders over $99.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/category"
              className="inline-flex items-center justify-center gap-2 bg-white text-fatman-accent font-black text-lg px-10 py-4 rounded-lg hover:bg-white/90 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
            >
              SHOP ALL PARTS
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold text-lg px-10 py-4 rounded-lg transition-all duration-200"
            >
              Talk to a Human
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STICKY MOBILE CTA
         ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-fatman-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-area-pb">
        <Link
          href="/category"
          className="flex items-center justify-center gap-2 w-full bg-fatman-accent hover:bg-fatman-accent-hover text-white font-bold text-base py-3.5 rounded-lg transition-colors"
        >
          <span>FIND YOUR PART</span>
          <span>→</span>
        </Link>
      </div>

      {/* Spacer for sticky CTA on mobile */}
      <div className="h-16 md:hidden" />
    </main>
  );
}
