import Link from "next/link";
import type { ReactNode } from "react";

type InfoPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  cta?: {
    href: string;
    label: string;
  };
};

export function InfoPage({ eyebrow = "Fatman Parts", title, description, children, cta }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-fatman-900 text-white">
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-fatman-accent">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-white/72 sm:text-lg">{description}</p>
          {cta ? (
            <div className="mt-6">
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full bg-fatman-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fatman-accent-hover"
              >
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="mt-10 space-y-5">{children}</div>
      </section>
    </main>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm shadow-black/10 sm:p-6">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-white/72 sm:text-base">{children}</div>
    </section>
  );
}

export function InfoGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-base font-black text-white">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-6 text-white/72">{children}</div>
    </div>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
