"use client";

import type { ReactNode } from "react";

export function AnimatedReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="animate-[fadeUp_.6s_ease-out_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
