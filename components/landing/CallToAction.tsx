"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";

interface CallToActionProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

export function CallToAction({ dashboardHref, ctaLabel }: CallToActionProps) {
  return (
    <section className="bg-background">
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Ready To Replace Bookmark Chaos?
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Move from scattered links to a curated, searchable library in one
            session. Reway keeps your knowledge readable and always within reach.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <Button
            asChild
            size="lg"
            className="h-11 rounded-3xl px-6 text-sm font-semibold transition-[color,background-color] duration-200 ease-out"
          >
            <Link href={dashboardHref}>
              {ctaLabel}
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
