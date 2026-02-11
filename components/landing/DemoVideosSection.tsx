"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type Variants,
} from "motion/react";
import { demoVideos } from "./features/demo-data";
import { DemoVideo } from "./features/DemoVideo";
import { cn } from "@/lib/utils";

export function DemoVideosSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const progress = useMotionValue(0);
  const width = useTransform(progress, (v) => `${v}%`);
  const shouldReduceMotion = useReducedMotion();
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const handleEnded = () => {
    setActiveIndex((current) => (current + 1) % demoVideos.length);
    progress.set(0);
  };

  const handleIndexChange = (index: number) => {
    setActiveIndex(index);
    progress.set(0);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section
      id="demo-videos"
      className="border-b border-foreground/8 bg-muted/20 overflow-hidden"
    >
      <motion.div
        className="mx-auto flex w-full max-w-350 flex-col gap-12 px-4 py-20 sm:px-6 lg:py-32"
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView={shouldReduceMotion ? undefined : "visible"}
        viewport={{ once: true, margin: "-120px" }}
        variants={shouldReduceMotion ? undefined : containerVariants}
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </p>
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything you need <br className="hidden sm:block" />
            to stay in flow.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Video Showcase Side - Larger (8/12) & Top on Mobile */}
          <div
            className="lg:col-span-8 order-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl ring-1 ring-foreground/8 bg-black/5 isolate">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full w-full"
                >
                  <DemoVideo
                    src={demoVideos[activeIndex].src}
                    className="h-full w-full object-cover"
                    hideControls
                    loop={false}
                    onProgressUpdate={(v) => {
                      if (activeIndexRef.current !== activeIndex) return;
                      progress.set(v);
                    }}
                    onEnded={() => {
                      if (activeIndexRef.current !== activeIndex) return;
                      handleEnded();
                    }}
                    isHovered={isHovered}
                  />

                  {/* Subtle accent glow - keeping it but removing shadows */}
                  <div
                    className={cn(
                      "absolute -inset-10 -z-10 opacity-10 blur-3xl transition-colors duration-1000",
                      demoVideos[activeIndex].accentColor,
                    )}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Accordion Side - Compact (4/12) */}
          <div className="lg:col-span-4 order-2">
            <div className="flex flex-col gap-2">
              {demoVideos.map((video, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={video.title}
                    onClick={() => handleIndexChange(index)}
                    className={cn(
                      "group relative flex flex-col items-start rounded-3xl p-6 transition-all duration-300 text-left cursor-pointer",
                      isActive
                        ? "bg-background ring-1 ring-foreground/8"
                        : "hover:bg-background/50",
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                            isActive
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className={cn(
                            "text-lg font-semibold transition-colors duration-300",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {video.title}
                        </h3>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            marginTop: 16,
                          }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden w-full"
                        >
                          <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                            {video.description}
                          </p>

                          {/* Progress bar container */}
                          <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted/40">
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-foreground origin-left"
                              style={{ width }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
