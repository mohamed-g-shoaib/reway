"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll as useMotionScroll } from "motion/react";

export function useScroll(downThreshold: number, upThreshold?: number) {
  const scrollUpThreshold = upThreshold ?? downThreshold / 2;
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window === "undefined") return false;
    const y = window.scrollY;
    return y > downThreshold;
  });

  const { scrollY } = useMotionScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const nextY = typeof y === "number" ? y : Number(y);
    setScrolled((prev) => {
      if (prev) {
        return nextY > scrollUpThreshold;
      }
      return nextY > downThreshold;
    });
  });

  return scrolled;
}
