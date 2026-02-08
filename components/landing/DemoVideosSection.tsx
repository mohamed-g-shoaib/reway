"use client";

import { motion } from "motion/react";
import { demoVideos } from "./features/demo-data";
import { DemoVideo } from "./features/DemoVideo";
import { cn } from "@/lib/utils";

export function DemoVideosSection() {
  return (
    <section id="demo-videos" className="border-b border-border/60 bg-muted/20">
      <motion.div
        className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
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
              className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center rounded-4xl border border-border bg-background p-6 shadow-sm"
            >
              {/* Video Side - Dominant (8/12 columns) */}
              <div
                className={cn(
                  "lg:col-span-8",
                  index % 2 === 0 ? "lg:order-1" : "lg:order-2",
                )}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border bg-muted/5">
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
                <div className="flex flex-col gap-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-semibold leading-tight text-foreground tracking-tight sm:text-4xl">
                      {video.title}
                    </h3>
                    <p className="text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
                      {video.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-4">
                    {video.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-3 text-base text-muted-foreground leading-relaxed sm:text-lg"
                      >
                        <span className="size-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
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
