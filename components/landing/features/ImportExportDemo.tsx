"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileUploadIcon,
  FileDownloadIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

export function ImportExportDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(shouldReduceMotion ? 2 : 0);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 3);
    }, 2200);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  return (
    <div className="w-full">
      <div className="grid gap-2">
        <div className="flex items-center justify-between rounded-2xl ring-1 ring-foreground/8 bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-background">
              <HugeiconsIcon icon={FileUploadIcon} size={14} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">
                Import bookmarks
              </div>
              <div className="text-[10px] text-muted-foreground">
                Chrome HTML
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.span
                key="importing"
                className="text-[10px] font-medium text-muted-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              >
                Importing...
              </motion.span>
            ) : null}
            {phase !== 0 ? (
              <motion.span
                key="imported"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                Done
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between rounded-2xl ring-1 ring-foreground/8 bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-background">
              <HugeiconsIcon icon={FileDownloadIcon} size={14} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground">
                Export group
              </div>
              <div className="text-[10px] text-muted-foreground">JSON</div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {phase === 1 ? (
              <motion.span
                key="exporting"
                className="text-[10px] font-medium text-muted-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              >
                Exporting...
              </motion.span>
            ) : null}
            {phase !== 1 ? (
              <motion.span
                key="exported"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                Ready
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
