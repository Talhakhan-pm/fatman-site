"use client";

import { useEffect, useState } from "react";

export function RotatingText({ words, intervalMs = 2200 }: { words: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);

    return () => clearInterval(t);
  }, [words.length, intervalMs]);

  return (
    <span className="inline-block min-w-32 rounded-md bg-fatman-accent px-2 py-1 text-fatman-900 transition-all duration-300">
      {words[index]}
    </span>
  );
}
