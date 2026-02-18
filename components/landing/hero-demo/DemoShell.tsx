"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

export function DemoShell({
  children,
  controls,
}: {
  children: React.ReactNode;
  controls?: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  const showcaseVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="w-full"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-3 px-0 text-[11px] font-medium text-muted-foreground text-center sm:text-left">
        <span className="inline-block">
          Interactive demo, click around (nothing is saved)
        </span>
        {controls ? <div className="mt-2 flex justify-center sm:justify-start">{controls}</div> : null}
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
