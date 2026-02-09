"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  FileNotFoundIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <main className="w-full max-w-3xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <HugeiconsIcon icon={FileNotFoundIcon} size={28} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                Page not found
              </h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-3xl">
              <Link href="/">
                <HugeiconsIcon icon={Home01Icon} size={18} className="mr-2" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-3xl">
              <Link href="/login">
                Sign in
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  className="ml-2"
                />
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
