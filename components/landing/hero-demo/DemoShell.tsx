"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

export function DemoShell({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  const showcaseVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-3 px-0 text-[11px] font-medium text-muted-foreground">
        <span className="inline sm:hidden">Interactive demo</span>
        <span className="hidden sm:inline">
          Interactive demo — click around (nothing is saved)
        </span>
      </div>

      <motion.div
        id="how-it-works"
        className="w-full overflow-hidden rounded-4xl ring-1 ring-foreground/8 bg-card shadow-none isolate"
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-120px" }}
        variants={shouldReduceMotion ? undefined : showcaseVariants}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
