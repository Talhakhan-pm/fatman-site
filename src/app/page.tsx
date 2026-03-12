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
import { getCategoryMedia } from "@/lib/catalog-media";

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
] as const;

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
    <div className="mb-4 inline-flex items-center gap-2">
      <span className="h-[2px] w-8 bg-[#ff6a00]" />
      <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#ff6a00]">
        {children}
      </span>
      <span className="h-[2px] w-8 bg-[#ff6a00]" />
    </div>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[#111318] text-white">
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <section className="relative flex min-h-[100vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 0L25 10L20 20L15 10Z'/%3E%3Cpath d='M0 20L5 30L0 40L-5 30Z'/%3E%3Cpath d='M40 20L45 30L40 40L35 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div
          className="absolute right-[-5%] top-[-10%] h-[120%] w-[55%] bg-gradient-to-br from-[#ff6a00] to-[#c2410c] opacity-[0.07]"
          style={{ clipPath: "polygon(25% 0, 100% 0, 100% 100%, 5% 100%)", transform: "skewX(-6deg)" }}
        />

        <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-[#ff6a00]/[0.06] blur-[150px]" />

        <CautionStripe className="absolute left-0 right-0 top-0 z-20" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:py-0">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-8 lg:col-span-7">
              <div className="inline-flex items-center gap-3 animate-[fadeUp_0.5s_ease-out]">
                <span
                  className="flex h-6 items-center bg-[#ff6a00] px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)" }}
                >
                  OEM VERIFIED
                </span>
                <span className="font-mono text-sm text-white/40">
                  18,000+ fitment rules
                </span>
              </div>

              <h1 className="animate-[fadeUp_0.6s_ease-out_0.1s_both]">
                <span className="block text-5xl font-black leading-[0.9] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">
                  THE RIGHT
                </span>
                <span className="block text-5xl font-black leading-[0.9] tracking-[-0.03em] text-[#ff6a00] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">
                  <HeroRotatingText words={heroRotatingWords} intervalMs={2200} />
                </span>
                <span className="block text-5xl font-black leading-[0.9] tracking-[-0.03em] text-white/20 sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">
                  FIRST TIME.
                </span>
              </h1>

              <p className="max-w-lg animate-[fadeUp_0.6s_ease-out_0.2s_both] text-lg leading-relaxed text-white/50 sm:text-xl">
                Stop guessing compatibility. Enter your vehicle, get OEM-verified parts
                that are <span className="font-semibold text-white">guaranteed to fit</span> — shipped from the U.S. in 24–48 hours.
              </p>

              <div className="flex flex-wrap gap-4 animate-[fadeUp_0.6s_ease-out_0.3s_both]">
                <Link
                  href="/category"
                  className="group relative inline-flex items-center gap-3 bg-[#ff6a00] px-8 py-4 text-base font-black uppercase tracking-wide text-white transition-all duration-200 hover:translate-y-[-2px] hover:bg-[#e55d00] hover:shadow-[0_8px_40px_rgba(255,106,0,0.35)] sm:text-lg"
                  style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}
                >
                  FIND YOUR PART
                  <span className="font-mono transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-2 border-white/20 px-8 py-4 text-base font-bold uppercase tracking-wide text-white/60 transition-all duration-200 hover:border-[#ff6a00]/60 hover:text-white sm:text-lg"
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
                  <span key={item} className="flex items-center gap-2 text-sm text-white/30 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-[fadeUp_0.8s_ease-out_0.3s_both] lg:col-span-5">
              <div className="relative border border-white/[0.08] bg-[#1a1d24] p-1">
                <CautionStripe />
                <FitmentModuleV2 />
                <CornerBrackets color="white/10" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 z-10 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, var(--page-bg))" }}
        />
      </section>

      <section className="relative border-y border-white/[0.05] bg-[#111318] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((badge, i) => (
              <div key={badge.title} className="group flex items-start gap-4" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="mt-0.5 shrink-0 text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-bold leading-tight text-white">{badge.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/35">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#111318] py-20 sm:py-28">
        <div className="absolute left-1/3 top-0 h-[400px] w-[400px] rounded-full bg-[#ff6a00]/[0.03] blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-14 text-center">
            <SectionTag>SHOP BY CATEGORY</SectionTag>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              What Are You <span className="text-[#ff6a00]">Working On?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {categories.map((cat, i) => {
              const media = getCategoryMedia(cat.slug);

              return (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group relative overflow-hidden border border-white/[0.06] bg-[#1a1d24] transition-all duration-300 hover:translate-y-[-3px] hover:border-[#ff6a00]/40 hover:shadow-[0_12px_40px_rgba(255,106,0,0.12)]"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="relative h-44 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] sm:h-48">
                    {media ? (
                      <>
                        <Image src={media.src} alt={media.alt} fill className="object-cover transition-all duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] via-black/10 to-transparent" />
                      </>
                    ) : (
                      <>
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
                          <div className="h-24 w-24 text-white/[0.35] transition-all duration-500 group-hover:scale-110 group-hover:text-[#ff6a00]/60 sm:h-28 sm:w-28">
                            <cat.Icon />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ff6a00]/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    {cat.tag && (
                      <span
                        className="absolute right-3 top-3 z-10 bg-[#ff6a00] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white"
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
                        <h3 className="text-base font-black uppercase leading-tight tracking-wide text-white transition-colors group-hover:text-[#ff6a00] sm:text-lg">
                          {cat.name}
                        </h3>
                        <p className="mt-1.5 text-sm text-white/35">{cat.desc}</p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.06] bg-white/[0.04] text-lg text-white/30 transition-all duration-300 group-hover:border-[#ff6a00]/30 group-hover:bg-[#ff6a00]/20 group-hover:text-[#ff6a00]">
                        →
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                      <span className="font-mono text-sm font-bold text-[#ff6a00]">{cat.count}</span>
                      <span className="font-mono text-xs uppercase tracking-wider text-white/25">Verified Parts</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/category" className="inline-flex items-center gap-2 font-mono text-sm text-white/40 transition-colors hover:text-[#ff6a00]">
              View All Categories <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-[#15181f]" />
        <div className="absolute left-0 right-0 top-0 h-20" style={{ background: "linear-gradient(to bottom, var(--page-bg), transparent)" }} />

        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-16 text-center">
            <SectionTag>HOW IT WORKS</SectionTag>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Three Steps. <span className="text-[#ff6a00]">Zero Guesswork.</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="group relative" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative h-full border border-white/[0.06] bg-[#1a1d24] p-8 transition-all duration-300 hover:border-[#ff6a00]/30 sm:p-10">
                  <span className="absolute right-6 top-4 select-none text-[5rem] font-black leading-none text-white/[0.03] sm:text-[6rem]">
                    {step.num}
                  </span>
                  <div className="mb-6 h-1 w-12 bg-[#ff6a00]" />
                  <span className="mb-3 block font-mono text-xs font-bold tracking-[0.2em] text-[#ff6a00]">
                    STEP {step.num}
                  </span>
                  <h3 className="mb-3 text-xl font-black uppercase leading-tight tracking-wide text-white sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mb-4 leading-relaxed text-white/50">{step.desc}</p>
                  <p className="font-mono text-xs text-white/25">{step.detail}</p>
                  <CornerBrackets color="white/[0.05]" />
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-20 hidden w-8 items-center justify-center md:flex">
                    <span className="font-mono text-xl text-[#ff6a00]/40">▸</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#111318] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-14 text-center">
            <SectionTag>CUSTOMER PROOF</SectionTag>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Don&apos;t Take Our <span className="text-[#ff6a00]">Word For It</span>
            </h2>
          </div>

          <div className="relative mb-14 grid grid-cols-2 gap-6 border border-white/[0.06] bg-[#1a1d24] p-6 sm:p-8 md:grid-cols-4">
            <CautionStripe className="absolute left-0 right-0 top-0" />
            {[
              { val: "5,200+", label: "OEM SKUs" },
              { val: "18K+", label: "Fitment Rules" },
              { val: "4.9★", label: "Avg Rating" },
              { val: "12K+", label: "Orders Shipped" },
            ].map((s) => (
              <div key={s.label} className="pt-2 text-center">
                <p className="font-mono text-3xl font-black leading-none tabular-nums text-white sm:text-4xl">{s.val}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-white/35">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative border border-white/[0.06] bg-[#1a1d24] p-7 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#ff6a00]/20 sm:p-8"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <span key={si} className="text-base text-[#ff6a00]">★</span>
                  ))}
                </div>
                <blockquote className="mb-6 text-[15px] leading-relaxed text-white/75">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-white/30">{t.vehicle}</p>
                </div>
                <span className="absolute right-6 top-5 select-none font-serif text-5xl leading-none text-white/[0.03]">
                  &ldquo;
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-orange relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6a00] to-[#c2410c]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 0L25 10L20 20L15 10Z'/%3E%3Cpath d='M0 20L5 30L0 40L-5 30Z'/%3E%3Cpath d='M40 20L45 30L40 40L35 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute left-0 right-0 top-0 h-2"
          style={{ background: "repeating-linear-gradient(-45deg, #000, #000 10px, transparent 10px, transparent 20px)", opacity: 0.15 }}
        />
        <div className="absolute -right-20 -top-20 h-80 w-80 rotate-12 border-2 border-white/10" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 -rotate-6 border-2 border-white/10" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-8">
          <h2 className="mb-5 text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            READY TO FIND<br />
            THE RIGHT PART?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Enter your vehicle and get OEM-verified parts that fit — guaranteed.
            Free shipping on orders over $99.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/category"
              className="inline-flex items-center justify-center gap-2 bg-white px-10 py-5 text-lg font-black uppercase tracking-wider text-[#111318] transition-all duration-200 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)" }}
            >
              SHOP ALL PARTS
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 px-10 py-5 text-lg font-bold uppercase tracking-wider text-white transition-all duration-200 hover:border-white"
            >
              Talk to a Human
            </Link>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ff6a00]/20 bg-[#111318]/95 px-4 py-3 backdrop-blur-md md:hidden">
        <Link
          href="/category"
          className="flex w-full items-center justify-center gap-2 bg-[#ff6a00] py-3.5 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#e55d00]"
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
