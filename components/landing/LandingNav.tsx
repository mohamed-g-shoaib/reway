"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";
import RewayLogo from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";

interface LandingNavProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export function LandingNav({ dashboardHref, ctaLabel }: LandingNavProps) {
  const hasScrolled = useScroll(8);
  const shouldReduceMotion = useReducedMotion();

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
      className="sticky top-0 z-40 md:top-4"
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      variants={shouldReduceMotion ? undefined : headerVariants}
    >
      <div className="mx-auto flex max-w-350 justify-center px-4 sm:px-6">
        <div
          className={`relative isolate inline-flex w-full max-w-115 items-center gap-3 sm:gap-6 rounded-full ring-1 ring-foreground/8 px-3 sm:px-4 py-2.5 transition-[background-color,ring-color] duration-200 ease-out after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-white/5 after:pointer-events-none ${
            hasScrolled ? "bg-background/95" : "bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 text-foreground transition-[color,transform] duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
            aria-label="Reway Home"
          >
            <RewayLogo
              className="size-7"
              aria-hidden="true"
              focusable="false"
            />
            <span className="text-base font-bold sm:text-lg">Reway</span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full px-2.5 sm:px-3 text-xs font-semibold transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none"
            >
              <Link href="#features">Features</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full px-2.5 sm:px-3 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-transform duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none ring-0"
            >
              <Link href={dashboardHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
