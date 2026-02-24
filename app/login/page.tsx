"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Google } from "@/components/google-logo";
import { signInWithGoogle } from "./actions";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const [isSigningIn, setIsSigningIn] = useState(false);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <main className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, transform: "translateY(10px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.26, ease: "easeOut" }
          }
          suppressHydrationWarning
          className="space-y-8"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to manage your bookmarks
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-3xl sm:w-auto"
            >
              <Link href="/">Back to Homepage</Link>
            </Button>
            <form
              action={signInWithGoogle}
              className="flex-1"
              onSubmit={(e) => {
                if (isSigningIn) {
                  e.preventDefault();
                  return;
                }
                setIsSigningIn(true);
              }}
            >
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="w-full rounded-3xl cursor-pointer"
                disabled={isSigningIn}
              >
                {!isSigningIn ? (
                  <Google
                    className="mr-2 size-5"
                    aria-hidden="true"
                    focusable="false"
                  />
                ) : null}
                {isSigningIn ? "Redirecting..." : "Continue with Google"}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
