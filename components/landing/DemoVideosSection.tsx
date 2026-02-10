"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { demoVideos } from "./features/demo-data";
import { DemoVideo } from "./features/DemoVideo";
import { cn } from "@/lib/utils";

export function DemoVideosSection() {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  return (
    <section
      id="demo-videos"
      className="border-b border-foreground/8 bg-muted/20"
    >
      <motion.div
        className="mx-auto flex w-full max-w-350 flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20"
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-120px" }}
        variants={shouldReduceMotion ? undefined : containerVariants}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            In Action
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            Experience Reway
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Watch how Reway streamlines your workflow, from instant link
            extraction to organizing your research with absolute precision.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          {demoVideos.map((video, index) => (
            <article
              key={video.title}
              className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center rounded-4xl ring-1 ring-foreground/8 bg-background p-6 shadow-none isolate"
            >
              {/* Video Side - Dominant (8/12 columns) */}
              <div
                className={cn(
                  "lg:col-span-8",
                  index % 2 === 0 ? "lg:order-1" : "lg:order-2",
                )}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl ring-1 ring-foreground/8 bg-black/5">
                  <DemoVideo src={video.src} className="h-full w-full" />
                </div>
              </div>

              {/* Text Side - Balanced & Dense (4/12 columns) */}
              <div
                className={cn(
                  "lg:col-span-4",
                  index % 2 === 0 ? "lg:order-2" : "lg:order-1",
                )}
              >
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                    {video.title}
                  </h3>
                  <p className="text-pretty text-base text-foreground/90 leading-relaxed sm:text-lg">
                    {video.description}
                  </p>

                  <ul className="space-y-2">
                    {video.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-3 text-base text-muted-foreground leading-relaxed sm:text-lg"
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            video.accentColor,
                          )}
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
