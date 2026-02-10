"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  GithubIcon,
  Linkedin02Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import BrandWord from "@/components/landing/BrandWord";
import { ThemeSwitcher } from "@/components/landing/ThemeSwitcher";
import RewayLogo from "@/components/logo";
import type { DashboardHref } from "@/components/landing/types";

export function LandingFooter() {
  const shouldReduceMotion = useReducedMotion();
  const socialLinks = [
    { icon: NewTwitterIcon, href: "https://x.com", label: "Twitter" },
    { icon: Linkedin02Icon, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: GithubIcon, href: "https://github.com", label: "GitHub" },
  ] as const;

  const footerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  const signatureVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: "easeOut" },
    },
  };

  return (
    <motion.footer
      className="border-t border-foreground/8 bg-background pt-16 pb-0"
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-120px" }}
      variants={shouldReduceMotion ? undefined : footerVariants}
    >
      <div className="mx-auto w-full max-w-350 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand Info (Occupying 4/12 columns) */}
          <div className="space-y-4 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground"
            >
              <RewayLogo
                className="size-6"
                aria-hidden="true"
                focusable="false"
              />
              <span className="font-semibold">Reway</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Built for research, inspiration, and building. Reway sits at the
              intersection of calm organization and powerful AI extraction.
            </p>
          </div>

          {/* Column 2: Product (2/12 columns) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase text-foreground">
              Product
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#demo-videos"
                  className="hover:text-foreground transition-colors"
                >
                  Demos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (2/12 columns) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase text-foreground">
              Legal
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={"/terms" as DashboardHref}
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href={"/privacy" as DashboardHref}
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect (2/12 columns) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase text-foreground">
              Connect
            </h4>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors duration-200 group-hover:bg-foreground group-hover:text-background border border-transparent group-hover:border-foreground">
                      <HugeiconsIcon icon={social.icon} size={14} />
                    </span>
                    <span className="font-medium">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Appearance (2/12 columns) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase text-foreground">
              Appearance
            </h4>
            <div className="mt-4">
              <ThemeSwitcher />
              <p className="mt-3 text-xs text-muted-foreground/60 leading-relaxed">
                Toggle between light and dark modes.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="pb-4 w-full text-muted-foreground/6"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true }}
          variants={shouldReduceMotion ? undefined : signatureVariants}
        >
          <BrandWord className="h-auto w-full select-none" />
        </motion.div>
      </div>
    </motion.footer>
  );
}
