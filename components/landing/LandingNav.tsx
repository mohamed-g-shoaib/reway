"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";

interface LandingNavProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export function LandingNav({ dashboardHref, ctaLabel }: LandingNavProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-4 z-40"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="mx-auto flex max-w-[1400px] justify-center px-4 sm:px-6">
        <div
          className={`inline-flex w-full max-w-[460px] items-center gap-3 sm:gap-6 rounded-full border px-3 sm:px-4 py-2.5 transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
            hasScrolled
              ? "border-border/80 bg-background/80 shadow-sm backdrop-blur-xl"
              : "border-transparent bg-transparent shadow-none"
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
            <span className="text-sm font-semibold tracking-tight sm:text-base">
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
