"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.045] text-xl shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-fatman-accent/55 hover:bg-fatman-accent/12 hover:scale-105"
      aria-label="Toggle theme"
    >
      <span className="relative z-10 transition-transform duration-500 ease-in-out">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
