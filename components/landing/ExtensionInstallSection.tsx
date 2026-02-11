"use client";

import { useState } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Idea01Icon } from "@hugeicons/core-free-icons";
import { DemoVideo } from "@/components/landing/features/DemoVideo";
import { EXTENSION_DOWNLOAD_URL, EXTENSION_TUTORIAL_VIDEO_URL } from "@/lib/extension";

const installStep = {
  title: "Install instructions",
  steps: [
    "Download the ZIP from Google Drive.",
    "Unzip it into a folder on your computer.",
    "Open chrome://extensions/ and enable Developer mode (top right).",
    "Click Load unpacked and select the unzipped folder (the one with manifest.json).",
    "Log in to Reway in the same browser (the extension uses your session).",
  ],
} as const;

export function ExtensionInstallSection() {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="extension" className="border-b border-foreground/8 bg-muted/20 overflow-hidden">
      <motion.div
        className="mx-auto flex w-full max-w-350 flex-col gap-12 px-4 py-20 sm:px-6 lg:py-32"
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-120px" }}
        variants={shouldReduceMotion ? undefined : containerVariants}
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Browser Extension
          </p>
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Install it in minutes.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div
            className="lg:col-span-8 order-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl ring-1 ring-foreground/8 bg-black/5 isolate">
              {EXTENSION_TUTORIAL_VIDEO_URL ? (
                <DemoVideo
                  src={EXTENSION_TUTORIAL_VIDEO_URL}
                  className="h-full w-full object-cover"
                  hideControls
                  loop
                  onProgressUpdate={(v) => {
                    void v;
                  }}
                  isHovered={isHovered}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-8 text-center">
                  <div className="text-sm text-muted-foreground">
                    Add your tutorial video URL to show the install walkthrough here.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 order-2">
            <div className="group relative flex flex-col items-start rounded-3xl p-6 text-left bg-background ring-1 ring-foreground/8">
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
                    <HugeiconsIcon icon={Idea01Icon} size={16} />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{installStep.title}</h3>
                </div>
              </div>

              <div className="mt-4 w-full">
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {installStep.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>

                {EXTENSION_DOWNLOAD_URL ? (
                  <a
                    className="mt-4 inline-flex break-all cursor-pointer text-sm font-medium text-foreground underline underline-offset-3"
                    href={EXTENSION_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {EXTENSION_DOWNLOAD_URL}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
