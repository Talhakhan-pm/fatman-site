"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.7 6.7 0 0 0 10.5 10.5z" />
    </svg>
  );
}

/**
 * `floating` is the desktop orb, bottom-left. `switch` is the phone variant:
 * a labelled segmented control in the footer. Phones can't spare the header
 * width (the search field earns that space) and the screen's bottom edge
 * belongs to the tab bar, so appearance lives with the other site settings.
 */
export function ThemeToggleButton({
  variant = "floating",
}: {
  variant?: "floating" | "switch";
}) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (variant === "switch") {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Appearance
        </span>
        <div
          className="relative inline-flex h-9 w-[104px] items-center rounded-full border border-white/12 bg-white/[0.045] p-1"
          role="group"
          aria-label="Theme"
        >
          <span
            className={`absolute left-1 top-1 h-7 w-12 rounded-full bg-fatman-accent shadow-[0_4px_14px_rgba(234,88,12,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1.12)] ${
              isDark ? "translate-x-full" : "translate-x-0"
            }`}
            aria-hidden="true"
          />
          <button
            onClick={() => { if (isDark) toggleTheme(); }}
            className="relative z-10 flex h-7 w-12 items-center justify-center rounded-full transition-colors"
            aria-label="Light theme"
            aria-pressed={!isDark}
          >
            <SunIcon className={`h-4 w-4 ${isDark ? "text-white/55" : "text-fatman-900"}`} />
          </button>
          <button
            onClick={() => { if (!isDark) toggleTheme(); }}
            className="relative z-10 flex h-7 w-12 items-center justify-center rounded-full transition-colors"
            aria-label="Dark theme"
            aria-pressed={isDark}
          >
            <MoonIcon className={`h-4 w-4 ${isDark ? "text-fatman-900" : "text-white/55"}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="fixed bottom-6 left-6 z-50 hidden h-11 w-11 items-center justify-center md:flex rounded-full border border-white/12 bg-white/[0.045] text-xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/55 hover:bg-fatman-accent/12 hover:scale-105"
      aria-label="Toggle theme"
    >
      <span className="relative z-10 transition-transform duration-500 ease-in-out">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
