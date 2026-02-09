"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import type { DashboardHref } from "@/components/landing/types";

interface CallToActionProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // Custom cubic bezier for more premium feel
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function CallToAction({ dashboardHref, ctaLabel }: CallToActionProps) {
  return (
    <section className="bg-background py-16 sm:py-24">
      <motion.div
        className="mx-auto w-full max-w-350 px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="relative overflow-hidden rounded-[3rem] ring-1 ring-foreground/8 bg-muted/20 px-6 py-16 shadow-none isolate sm:px-12 sm:py-24">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Ready To Replace Bookmark Chaos?
              </h2>
              <p className="mx-auto max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                Move from scattered links to a curated, searchable library in
                one session. Reway keeps your knowledge readable and always
                within reach.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-8 text-base font-semibold transition-[color,background-color] duration-200 ease-out sm:h-14 sm:px-10"
                >
                  <Link href={dashboardHref}>
                    {ctaLabel}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={20}
                      className="ml-2"
                    />
                  </Link>
                </Button>
              </motion.div>
              <p className="text-xs font-medium text-muted-foreground/60">
                Free to use. No account required to try the studio.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
