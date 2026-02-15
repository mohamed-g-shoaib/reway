"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { ExtensionInstallDialog } from "@/components/extension-install-dialog";
import { Google } from "@/components/google-logo";
import type { DashboardHref } from "@/components/landing/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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

export function CallToAction() {
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

  const primaryHref: DashboardHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Dashboard" : "Get Started";

  return (
    <section className="bg-background py-16 sm:py-24">
      <motion.div
        className="mx-auto w-full max-w-350 px-4 sm:px-6"
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-100px" }}
        variants={shouldReduceMotion ? undefined : containerVariants}
      >
        <div className="relative overflow-hidden rounded-[3rem] ring-1 ring-foreground/8 bg-muted/20 px-6 py-16 shadow-none isolate sm:px-12 sm:py-24">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
            <motion.div
              className="space-y-4"
              variants={shouldReduceMotion ? undefined : itemVariants}
            >
              <h2 className="text-balance text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
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
              variants={shouldReduceMotion ? undefined : itemVariants}
            >
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <motion.div
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 0.16, ease: "easeOut" }
                  }
                >
                  {isAuthenticated ? (
                    <Button
                      size="lg"
                      className="rounded-full px-8"
                      onClick={() => {
                        if (isPrimaryNavLoading) return;
                        setIsPrimaryNavLoading(true);
                        router.push("/dashboard");
                      }}
                      disabled={isPrimaryNavLoading}
                    >
                      {isPrimaryNavLoading ? "Loading..." : "Dashboard"}
                      {!isPrimaryNavLoading ? (
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={20}
                          className="ml-2"
                        />
                      ) : null}
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="rounded-full px-8">
                      <Link href={primaryHref}>
                        {primaryLabel}
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={20}
                          className="ml-2"
                        />
                      </Link>
                    </Button>
                  )}
                </motion.div>

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
