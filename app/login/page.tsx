"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChromeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signInWithGoogle } from "./actions";

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <main className="w-full max-w-md">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.26, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to manage your bookmarks
            </p>
          </div>

          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full rounded-3xl"
            >
              <HugeiconsIcon icon={ChromeIcon} size={20} className="mr-2" />
              Continue with Google
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
