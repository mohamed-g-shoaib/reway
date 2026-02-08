"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import {
  GithubIcon,
  Linkedin02Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import BrandWord from "@/components/landing/BrandWord";
import { ThemeSwitcher } from "@/components/landing/ThemeSwitcher";

export function LandingFooter() {
  return (
    <motion.footer
      className="border-t border-border/60 bg-background"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link
              href="https://x.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on X"
            >
              <HugeiconsIcon icon={NewTwitterIcon} size={16} />
            </Link>
            <Link
              href="https://linkedin.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on LinkedIn"
            >
              <HugeiconsIcon icon={Linkedin02Icon} size={16} />
            </Link>
            <Link
              href="https://github.com"
              className="inline-flex items-center transition-[color,transform] duration-200 ease-out hover:text-foreground active:scale-[0.97]"
              aria-label="Reway on GitHub"
            >
              <HugeiconsIcon icon={GithubIcon} size={16} />
            </Link>
          </div>
          <ThemeSwitcher />
        </div>
        <motion.div
          className="mt-4 w-full text-muted-foreground/15"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.26, ease: "easeOut" }}
        >
          <BrandWord className="h-auto w-full" />
        </motion.div>
        <div className="text-xs">
          © 2026 by{" "}
          <Link
            href="https://devloop.software/"
            className="font-semibold text-foreground transition-[color,transform] duration-200 ease-out hover:text-foreground/80 active:scale-[0.97]"
          >
            Devloop
          </Link>
        </div>
      </div>
    </motion.footer>
  );
}
