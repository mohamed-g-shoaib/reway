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
      <div className="mb-2 px-2 sm:px-3 text-xs font-medium text-muted-foreground">
        <div className="flex flex-col gap-2 items-center sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-block text-center sm:text-left">
            Interactive demo, click around (nothing is saved)
          </span>
          {controls ? (
            <div className="flex justify-center sm:justify-end w-full sm:w-auto">
              {controls}
            </div>
          ) : null}
        </div>
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
