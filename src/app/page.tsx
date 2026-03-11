/**
 * Homepage — Gritty Performance Garage Aesthetic (V2)
 *
 * This is the default homepage, based on homepage-test-v2 with
 * a fully interactive fitment module (Year → Make → Model → Engine).
 */

import Image from "next/image";
import Link from "next/link";
import { HeroRotatingText } from "@/components/hero-rotating-text";
import { FitmentModuleV2 } from "@/components/fitment-module-v2";
import {
  EngineIcon,
  BrakeIcon,
  SuspensionIcon,
  ExhaustIcon,
  ElectricalIcon,
  TransmissionIcon,
} from "@/components/category-icons";

/* ═══════════════════════ STATIC DATA ═══════════════════════ */

const categories = [
  {
    name: "Engines",
    slug: "engines",
    count: "1,200+",
    desc: "Long blocks, heads, complete assemblies",
    Icon: EngineIcon,
    tag: "BEST SELLER",
  },
  {
    name: "OEM Parts",
    slug: "oem-parts",
    count: "800+",
    desc: "VIN-aware, verified compatibility",
    Icon: BrakeIcon,
    tag: "POPULAR",
  },
  {
    name: "Suspension",
    slug: "suspension",
    count: "600+",
    desc: "Shocks, struts, ride-control parts",
    Icon: SuspensionIcon,
    tag: null,
  },
  {
    name: "Cooling",
    slug: "cooling",
    count: "400+",
    desc: "Radiators, thermostats, flow components",
    Icon: ExhaustIcon,
    tag: null,
  },
  {
    name: "Electrical",
    slug: "electrical",
    count: "950+",
    desc: "Sensors, harnesses, charging parts",
    Icon: ElectricalIcon,
    tag: "NEW",
  },
  {
    name: "Drivetrain",
    slug: "drivetrain",
    count: "550+",
    desc: "Trans, mounts, support systems",
    Icon: TransmissionIcon,
    tag: null,
  },
];

const heroRotatingWords = [
  "ENGINE.",
  "BRAKES.",
  "TURBO.",
  "CLUTCH.",
  "EXHAUST.",
  "COILS.",
];

const trustBadges = [
  { icon: "🎯", title: "99.4% Fitment Accuracy", sub: "Verified against 18K+ OEM rules" },
  { icon: "🚚", title: "Ships in 24–48h", sub: "From U.S. warehouses" },
  { icon: "↩️", title: "30-Day Easy Returns", sub: "Wrong part? We cover shipping back" },
  { icon: "🧑‍🔧", title: "Real Human Support", sub: "Call, chat, or email — we answer" },
];

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
    quote: "First time ordering parts online where the part actually fit. No returns, no headaches. These guys know their stuff.",
    name: "Marcus T.",
    vehicle: "2019 Silverado 1500",
    rating: 5,
  },
  {
    quote: "Ordered a turbo kit on Monday, had it by Wednesday. Fitment was dead-on. Will be back for suspension next.",
    name: "Jason R.",
    vehicle: "2021 F-150 EcoBoost",
    rating: 5,
  },
  {
    quote: "Their VIN lookup saved me from ordering the wrong engine block. Saved me $800 and a weekend of frustration.",
    name: "Dani K.",
    vehicle: "2017 RAM 2500 Cummins",
    rating: 5,
  },
];

/* ═══════════════════════ REUSABLE PATTERNS ═══════════════════════ */

function CornerBrackets({ color = "white/20" }: { color?: string }) {
  const c = `border-${color}`;
  return (
    <>
      <span className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${c}`} />
      <span className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${c}`} />
      <span className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${c}`} />
      <span className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${c}`} />
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
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-8 h-[2px] bg-[#ff6a00]" />
      <span className="text-[#ff6a00] font-mono text-xs tracking-[0.3em] uppercase font-bold">
        {children}
      </span>
      <span className="w-8 h-[2px] bg-[#ff6a00]" />
    </div>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[#111318] text-white">
      {/* Global noise grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0L25 10L20 20L15 10Z'/%3E%3Cpath d='M0 20L5 30L0 40L-5 30Z'/%3E%3Cpath d='M40 20L45 30L40 40L35 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          className="absolute top-[-10%] right-[-5%] w-[55%] h-[120%] bg-gradient-to-br from-[#ff6a00] to-[#c2410c] opacity-[0.07]"
          style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 5% 100%)", transform: "skewX(-6deg)" }}
        />

        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#ff6a00]/[0.06] blur-[150px]" />

        <CautionStripe className="absolute top-0 left-0 right-0 z-20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-24 lg:py-0">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left column — Copy */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-3 animate-[fadeUp_0.5s_ease-out]">
                <span
                  className="h-6 px-3 flex items-center text-[10px] font-black tracking-[0.2em] uppercase bg-[#ff6a00] text-white"
                  style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}
                >
                  OEM VERIFIED
                </span>
                <span className="text-white/40 text-sm font-mono">
                  18,000+ fitment rules
                </span>
              </div>

              <h1 className="animate-[fadeUp_0.6s_ease-out_0.1s_both]">
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[0.9] tracking-[-0.03em] text-white">
                  THE RIGHT
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[0.9] tracking-[-0.03em] text-[#ff6a00]">
                  <HeroRotatingText words={heroRotatingWords} intervalMs={2200} />
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black leading-[0.9] tracking-[-0.03em] text-white/20">
                  FIRST TIME.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/50 max-w-lg leading-relaxed animate-[fadeUp_0.6s_ease-out_0.2s_both]">
                Stop guessing compatibility. Enter your vehicle, get OEM-verified parts
                that are <span className="text-white font-semibold">guaranteed to fit</span> — shipped from the U.S. in 24–48 hours.
              </p>

              <div className="flex flex-wrap gap-4 animate-[fadeUp_0.6s_ease-out_0.3s_both]">
                <Link
                  href="/category"
                  className="group relative inline-flex items-center gap-3 bg-[#ff6a00] hover:bg-[#e55d00] text-white font-black text-base sm:text-lg uppercase tracking-wide px-8 py-4 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_40px_rgba(255,106,0,0.35)]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}
                >
                  FIND YOUR PART
                  <span className="group-hover:translate-x-1 transition-transform font-mono">→</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-2 border-white/20 hover:border-[#ff6a00]/60 text-white/60 hover:text-white font-bold text-base sm:text-lg uppercase tracking-wide px-8 py-4 transition-all duration-200"
                >
                  How It Works
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 animate-[fadeUp_0.6s_ease-out_0.4s_both]">
                {[
                  "5,200+ OEM SKUs",
                  "4.9★ Rating",
                  "Free Shipping $99+",
                ].map((item) => (
                  <span key={item} className="text-white/30 text-sm font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#ff6a00] rounded-full" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right column — Interactive Fitment Module */}
            <div className="lg:col-span-5 animate-[fadeUp_0.8s_ease-out_0.3s_both] space-y-4">
              <div className="relative overflow-hidden bg-[#1a1d24] border border-white/[0.08] p-1">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.08]">
                  <Image
                    src="/editorial/fatman-engine-warehouse-hero.png"
                    alt="OEM engine assembly palletized in a warehouse for fast shipment"
                    fill
                    className="object-cover"
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/35 to-transparent" />
                  <div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#ff6a00]">Fast Fulfillment</p>
                      <p className="mt-2 max-w-xs text-sm text-white/70">Warehouse-packed engine inventory matched against OEM fitment rules before it ships.</p>
                    </div>
                    <span className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-white/70">
                      U.S. Ready Stock
                    </span>
                  </div>
                </div>
                <CautionStripe />
                <FitmentModuleV2 />
                <CornerBrackets color="white/10" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-32 z-10"
          style={{ background: "linear-gradient(to bottom, transparent, var(--page-bg))" }}
        />
      </section>

      {/* ═══════════ TRUST STRIP ═══════════ */}
      <section className="relative bg-[#111318] py-8 sm:py-10 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <div key={badge.title} className="flex items-start gap-4 group" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-2xl shrink-0 mt-0.5">{badge.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{badge.title}</p>
                  <p className="text-white/35 text-xs mt-1 leading-relaxed">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="relative bg-[#111318] py-20 sm:py-28">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#ff6a00]/[0.03] blur-[120px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-14">
            <SectionTag>SHOP BY CATEGORY</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-2">
              What Are You <span className="text-[#ff6a00]">Working On?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative bg-[#1a1d24] border border-white/[0.06] hover:border-[#ff6a00]/40 overflow-hidden transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[0_12px_40px_rgba(255,106,0,0.12)]"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative h-44 sm:h-48 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-b border-white/[0.06] overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,106,0,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,106,0,0.3) 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1a1d24] to-transparent opacity-40 category-icon-wash" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 text-white/[0.35] group-hover:text-[#ff6a00]/60 transition-all duration-500 group-hover:scale-110">
                      <cat.Icon />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#ff6a00]/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {cat.tag && (
                    <span
                      className="absolute top-3 right-3 text-[9px] font-black tracking-[0.15em] uppercase px-2.5 py-1 bg-[#ff6a00] text-white z-10"
                      style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}
                    >
                      {cat.tag}
                    </span>
                  )}
                  <CornerBrackets color="white/[0.08]" />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-[#ff6a00] transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-white/35 text-sm mt-1.5">{cat.desc}</p>
                    </div>
                    <span className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/[0.04] group-hover:bg-[#ff6a00]/20 border border-white/[0.06] group-hover:border-[#ff6a00]/30 text-white/30 group-hover:text-[#ff6a00] transition-all duration-300 text-lg">
                      →
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-[#ff6a00] font-mono text-sm font-bold">{cat.count}</span>
                    <span className="text-white/25 text-xs font-mono uppercase tracking-wider">Verified Parts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/category" className="inline-flex items-center gap-2 text-white/40 hover:text-[#ff6a00] font-mono text-sm transition-colors">
              View All Categories <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#15181f]" />
        <div className="absolute top-0 left-0 right-0 h-20" style={{ background: "linear-gradient(to bottom, var(--page-bg), transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <SectionTag>HOW IT WORKS</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-2">
              Three Steps. <span className="text-[#ff6a00]">Zero Guesswork.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 items-start">
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="group relative" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="relative bg-[#1a1d24] border border-white/[0.06] hover:border-[#ff6a00]/30 p-8 sm:p-10 transition-all duration-300 h-full">
                    <span className="absolute top-4 right-6 text-[5rem] sm:text-[6rem] font-black text-white/[0.03] leading-none select-none">
                      {step.num}
                    </span>
                    <div className="w-12 h-1 bg-[#ff6a00] mb-6" />
                    <span className="text-[#ff6a00] font-mono text-xs font-bold tracking-[0.2em] mb-3 block">
                      STEP {step.num}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed mb-4">{step.desc}</p>
                    <p className="text-white/25 text-xs font-mono">{step.detail}</p>
                    <CornerBrackets color="white/[0.05]" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 z-20 w-8 items-center justify-center">
                      <span className="text-[#ff6a00]/40 text-xl font-mono">▸</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-none border border-white/[0.06] bg-[#1a1d24] min-h-[320px]">
              <Image
                src="/editorial/fatman-parts-pick-warehouse-aisle.png"
                alt="Warehouse aisle with organized OEM parts inventory ready for picking"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#ff6a00]">Warehouse Confidence</p>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-wide text-white">Picked Fast. Verified Before It Leaves.</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">Real inventory, organized picking, and fitment checks before outbound shipping.</p>
              </div>
              <CornerBrackets color="white/[0.08]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="relative bg-[#111318] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-14">
            <SectionTag>CUSTOMER PROOF</SectionTag>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-2">
              Don&apos;t Take Our <span className="text-[#ff6a00]">Word For It</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 p-6 sm:p-8 bg-[#1a1d24] border border-white/[0.06] relative">
            <CautionStripe className="absolute top-0 left-0 right-0" />
            {[
              { val: "5,200+", label: "OEM SKUs" },
              { val: "18K+", label: "Fitment Rules" },
              { val: "4.9★", label: "Avg Rating" },
              { val: "12K+", label: "Orders Shipped" },
            ].map((s) => (
              <div key={s.label} className="text-center pt-2">
                <p className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums leading-none">{s.val}</p>
                <p className="text-white/35 text-xs mt-2 uppercase tracking-[0.15em] font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative bg-[#1a1d24] border border-white/[0.06] hover:border-[#ff6a00]/20 p-7 sm:p-8 transition-all duration-300 hover:translate-y-[-2px]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <span key={si} className="text-[#ff6a00] text-base">★</span>
                  ))}
                </div>
                <blockquote className="text-white/75 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">{t.vehicle}</p>
                </div>
                <span className="absolute top-5 right-6 text-5xl text-white/[0.03] font-serif leading-none select-none">
                  &ldquo;
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CLOSING CTA ═══════════ */}
      <section className="cta-orange relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6a00] to-[#c2410c]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 0L25 10L20 20L15 10Z'/%3E%3Cpath d='M0 20L5 30L0 40L-5 30Z'/%3E%3Cpath d='M40 20L45 30L40 40L35 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: "repeating-linear-gradient(-45deg, #000, #000 10px, transparent 10px, transparent 20px)", opacity: 0.15 }}
        />
        <div className="absolute -top-20 -right-20 w-80 h-80 border-2 border-white/10 rotate-12" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 border-2 border-white/10 -rotate-6" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight mb-5 leading-[1.05]">
            READY TO FIND<br />
            THE RIGHT PART?
          </h2>
          <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Enter your vehicle and get OEM-verified parts that fit — guaranteed.
            Free shipping on orders over $99.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/category"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#111318] font-black text-lg uppercase tracking-wider px-10 py-5 hover:bg-white/90 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}
            >
              SHOP ALL PARTS
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 hover:border-white text-white font-bold text-lg uppercase tracking-wider px-10 py-5 transition-all duration-200"
            >
              Talk to a Human
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ STICKY MOBILE CTA ═══════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#111318]/95 backdrop-blur-md border-t border-[#ff6a00]/20 px-4 py-3">
        <Link
          href="/category"
          className="flex items-center justify-center gap-2 w-full bg-[#ff6a00] hover:bg-[#e55d00] text-white font-black text-sm uppercase tracking-wider py-3.5 transition-colors"
          style={{ clipPath: "polygon(0 0, 100% 0, 99% 100%, 1% 100%)" }}
        >
          <span>🔍</span>
          <span>FIND YOUR PART NOW</span>
          <span>→</span>
        </Link>
      </div>

      <div className="h-16 md:hidden" />
    </main>
  );
}
