"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll as useMotionScroll } from "motion/react";

export function useScroll(downThreshold: number, upThreshold?: number) {
  const [scrolled, setScrolled] = useState(false);
  const scrollUpThreshold = upThreshold ?? downThreshold / 2;

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const y = window.scrollY;
    setScrolled((prev) => {
      if (prev) {
        return y > scrollUpThreshold;
      }
      return y > downThreshold;
    });
  }, [downThreshold, scrollUpThreshold]);

  return scrolled;
}
