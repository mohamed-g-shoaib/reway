"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";

interface LandingNavProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export function LandingNav({ dashboardHref, ctaLabel }: LandingNavProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 8;
      setHasScrolled((prev) => (prev === next ? prev : next));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <motion.header
      className="sticky top-4 z-40"
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      variants={shouldReduceMotion ? undefined : headerVariants}
    >
      <div className="mx-auto flex max-w-350 justify-center px-4 sm:px-6">
        <div
          className={`inline-flex w-full max-w-115 items-center gap-3 sm:gap-6 rounded-full ring-1 px-3 sm:px-4 py-2.5 transition-[background-color,ring-color] duration-200 ease-out ${
            hasScrolled
              ? "ring-foreground/8 bg-background/95 shadow-none"
              : "ring-foreground/0 bg-transparent shadow-none"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-foreground transition-[color,transform] duration-200 ease-out active:scale-[0.97]"
            aria-label="Reway Home"
          >
            <Image
              src="/logo.svg"
              width={28}
              height={28}
              alt="Reway Logo"
              className="dark:invert"
            />
            <span className="text-sm font-semibold sm:text-base">
              Reway
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full px-2.5 sm:px-3 text-xs font-semibold transition-[color,background-color,transform] duration-200 ease-out active:scale-[0.97]"
            >
              <Link href="#features">Features</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full px-2.5 sm:px-3 text-xs font-semibold transition-[color,background-color,transform] duration-200 ease-out active:scale-[0.97]"
            >
              <Link href={dashboardHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
