"use client";

import { useEffect, useState, useCallback } from "react";

interface HeroRotatingTextProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

/**
 * 21st.dev-style rotating text for the hero headline.
 * Smooth vertical slide + fade transition between words.
 */
export function HeroRotatingText({
  words,
  intervalMs = 2400,
  className = "",
}: HeroRotatingTextProps) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = useCallback(() => {
    setIsAnimating(true);
    // After exit animation, swap word and enter
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
      setIsAnimating(false);
    }, 300);
  }, [words.length]);

  useEffect(() => {
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
  }, [next, intervalMs]);

  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <span
        className="inline-block transition-all duration-300 ease-out"
        style={{
          transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
          opacity: isAnimating ? 0 : 1,
        }}
      >
        {words[index]}
      </span>
    </span>
  );
}
