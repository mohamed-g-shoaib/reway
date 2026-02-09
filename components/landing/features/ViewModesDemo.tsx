"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { demoLinks } from "./demo-data";

export function ViewModesDemo() {
  const views = ["Card", "List", "Icons"];
  const [activeView, setActiveView] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const timer = setInterval(() => {
      setActiveView((prev) => (prev + 1) % views.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, views.length]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        {views.map((view, index) => (
          <button
            key={view}
            type="button"
            className="relative rounded-full px-2 py-1 transition-[color,background-color,transform] duration-200 ease-out active:scale-[0.97]"
          >
            <span
              className={`absolute inset-0 rounded-full bg-muted/60 ${
                activeView === index ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transition: shouldReduceMotion
                  ? "none"
                  : "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
            <span
              className={`relative z-10 ${
                activeView === index ? "text-foreground" : ""
              }`}
            >
              {view}
            </span>
          </button>
        ))}
      </div>
      <div className="relative h-30">
        <AnimatePresence mode="wait">
          {activeView === 0 ? (
            <motion.div
              key="card"
              className="grid grid-cols-2 gap-3 px-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {demoLinks.slice(0, 2).map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-muted/30 p-3 ring-1 ring-foreground/8"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-background">
                      <Image
                        src={item.favicon}
                        alt={`${item.title} favicon`}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground/70">
                        {item.domain}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/70">
                    <span>{item.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-[background-color,transform] duration-200 ease-out active:scale-[0.97]"
                        aria-label="Copy link"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={12} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-[background-color,transform] duration-200 ease-out active:scale-[0.97]"
                        aria-label="Open link"
                      >
                        <HugeiconsIcon icon={ArrowUpRight03Icon} size={12} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 text-destructive transition-[color,background-color,transform] duration-200 ease-out active:scale-[0.97]"
                        aria-label="Delete link"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : null}
          {activeView === 1 ? (
            <motion.div
              key="list"
              className="grid gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            >
              {demoLinks.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl ring-1 ring-foreground/8 bg-muted/30 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={item.favicon}
                      alt={`${item.title} favicon`}
                      width={16}
                      height={16}
                      className="h-4 w-4"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-semibold text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70">
                    {item.date}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : null}
          {activeView === 2 ? (
            <motion.div
              key="icons"
              className="grid grid-cols-3 gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            >
              {demoLinks.slice(0, 3).map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center justify-center rounded-xl ring-1 ring-foreground/8 bg-muted/30 px-3 py-3 text-xs text-center"
                >
                  <Image
                    src={item.favicon}
                    alt={`${item.title} favicon`}
                    width={28}
                    height={28}
                    className="h-7 w-7"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className="mt-2 text-[10px] font-semibold text-foreground">
                    {item.title}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
