"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExtensionInstallDialog } from "@/components/extension-install-dialog";
import { Google } from "@/components/google-logo";
import { HeroDemoPreview } from "@/components/landing/HeroDemoPreview";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isPrimaryNavLoading, setIsPrimaryNavLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setIsAuthenticated(Boolean(data?.user)))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Dashboard" : "Get Started";

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  return (
    <section className="border-b border-foreground/8 bg-background">
      <div className="mx-auto flex w-full max-w-350 flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-20">
        <motion.div
          className="space-y-6 text-center"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-120px" }}
          variants={shouldReduceMotion ? undefined : sectionVariants}
        >
          <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            A Calm Home For Everything You Save.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Reway turns noisy links into a structured library. Capture links in
            seconds, extract what matters from pasted text, and move fast with
            search, groups, and view modes that match the way you think.
          </p>

          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 pt-1">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="rounded-full px-8 cursor-pointer"
                  onClick={() => {
                    if (isPrimaryNavLoading) return;
                    setIsPrimaryNavLoading(true);
                    router.push("/dashboard");
                  }}
                  disabled={isPrimaryNavLoading}
                >
                  {isPrimaryNavLoading ? "Loading..." : "Dashboard"}
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 cursor-pointer"
                >
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
              )}

              <ExtensionInstallDialog>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 cursor-pointer"
                >
                  <Google
                    className="mr-2 size-4"
                    aria-hidden="true"
                    focusable="false"
                  />
                  Download Extension
                </Button>
              </ExtensionInstallDialog>
            </div>
          </div>
        </motion.div>

        <HeroDemoPreview />
      </div>
    </section>
  );
}
