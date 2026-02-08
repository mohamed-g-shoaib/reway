"use client";

import { motion } from "motion/react";
import { features } from "./features/demo-data";
import { ExtractDemo } from "./features/ExtractDemo";
import { GroupsDemo } from "./features/GroupsDemo";
import { NavigationDemo } from "./features/NavigationDemo";
import { ViewModesDemo } from "./features/ViewModesDemo";

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/60 bg-muted/20">
      <motion.div
        className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Core Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            The Essentials, Without The Noise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Every feature reinforces the same promise: keep your knowledge
            clean, searchable, and ready when you need it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-4 rounded-4xl border border-border bg-background p-5 shadow-sm"
            >
              <div className="flex min-h-24 items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="flex h-46 items-center overflow-visible">
                {feature.demo === "extract" ? <ExtractDemo /> : null}
                {feature.demo === "groups" ? <GroupsDemo /> : null}
                {feature.demo === "navigate" ? <NavigationDemo /> : null}
                {feature.demo === "views" ? <ViewModesDemo /> : null}
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
