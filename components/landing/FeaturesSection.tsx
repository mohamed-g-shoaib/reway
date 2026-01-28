"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Copy01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  Alert02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import TextShimmer from "@/components/ui/text-shimmer";

const features = [
  {
    title: "AI Link Extraction",
    description:
      "Drop in messy notes or screenshots. Reway pulls every link, title, and preview without extra steps.",
    demo: "extract",
  },
  {
    title: "Groups That Stay Organized",
    description:
      "Keep research, inspiration, and builds separated with labeled groups and smart counts.",
    demo: "groups",
  },
  {
    title: "Keyboard Navigation",
    description:
      "Move through bookmarks with arrow keys, preview instantly, and act without touching the mouse.",
    demo: "navigate",
  },
  {
    title: "Flexible View Modes",
    description:
      "Switch between cards and list layouts, depending on how much context you need right now.",
    demo: "views",
  },
];

const demoLinks = [
  {
    title: "Linear",
    domain: "linear.app",
    url: "https://linear.app",
    date: "Sep 12",
    favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
  },
  {
    title: "Vercel",
    domain: "vercel.com",
    url: "https://vercel.com",
    date: "Sep 10",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
  },
  {
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com",
    date: "Sep 09",
    favicon: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Core Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold text-foreground sm:text-4xl">
            The Essentials, Without The Noise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Every feature reinforces the same promise: keep your knowledge clean,
            searchable, and ready when you need it.
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
              <div className="flex h-[184px] items-center overflow-visible">
                {feature.demo === "extract" ? <ExtractDemo /> : null}
                {feature.demo === "groups" ? <GroupsDemo /> : null}
                {feature.demo === "navigate" ? <NavigationDemo /> : null}
                {feature.demo === "views" ? <ViewModesDemo /> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExtractDemo() {
  const [phase, setPhase] = useState(0);
  const [typedIndex, setTypedIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const typingText =
    "check: https://linear.app, https://vercel.com, https://ui.shadcn.com";

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedIndex(typingText.length);
      setPhase(2);
      return undefined;
    }
    if (phase !== 0) return undefined;
    setTypedIndex(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startTyping = () => {
      intervalId = setInterval(() => {
        setTypedIndex((prev) => {
          if (prev >= typingText.length) {
            if (intervalId) clearInterval(intervalId);
            setTimeout(() => setPhase(1), 400);
            return prev;
          }
          return prev + 1;
        });
      }, 28);
    };
    startTyping();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [phase, shouldReduceMotion, typingText]);

  useEffect(() => {
    if (shouldReduceMotion || phase !== 1) return undefined;
    const timer = setTimeout(() => setPhase(2), 2600);
    return () => clearTimeout(timer);
  }, [phase, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || phase !== 2) return undefined;
    const timer = setTimeout(() => setPhase(0), 3200);
    return () => clearTimeout(timer);
  }, [phase, shouldReduceMotion]);

  const inputLinks = useMemo(
    () => [
      "https://linear.app/board",
      "https://vercel.com/ideas",
      "https://ui.shadcn.com",
    ],
    [],
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground">
            <HugeiconsIcon icon={Add01Icon} size={14} />
          </span>
          <span className="flex min-w-0 flex-1 items-center justify-start text-foreground">
            <span className="w-full whitespace-normal break-all text-[12px] font-medium leading-snug sm:text-sm">
              {typingText.slice(0, typedIndex)}
            </span>
          </span>
          <div className="ml-auto hidden shrink-0 items-center gap-1 text-[10px] text-muted-foreground/70 sm:flex">
            <KbdGroup>
              <Kbd>{"⌘"}</Kbd>
              <Kbd>F</Kbd>
            </KbdGroup>
          </div>
        </div>
        <div className="relative h-[108px]">
          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.div
                key="adding"
                className="grid gap-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              >
                {inputLinks.map((link) => (
                  <div
                    key={link}
                    className="flex h-8 items-center justify-between rounded-xl border border-dashed border-border/70 px-3 text-[11px] opacity-40"
                  />
                ))}
              </motion.div>
            ) : null}
            {phase === 1 ? (
              <motion.div
                key="fetching"
                className="grid gap-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              >
                {demoLinks.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between px-1 text-[11px]"
                  >
                    <div className="flex min-w-0 flex-col">
                      <TextShimmer
                        as="span"
                        className="block truncate text-sm font-semibold"
                        duration={2.5}
                        delay={index * 0.15}
                      >
                        {item.title}
                      </TextShimmer>
                      <TextShimmer
                        as="span"
                        className="block truncate text-xs font-medium"
                        duration={2.5}
                        delay={index * 0.15 + 0.2}
                      >
                        {item.url}
                      </TextShimmer>
                    </div>
                    <TextShimmer
                      as="span"
                      className="text-[10px] font-medium"
                      duration={2.5}
                      delay={0.4}
                    >
                      Enriching...
                    </TextShimmer>
                  </div>
                ))}
              </motion.div>
            ) : null}
            {phase === 2 ? (
              <motion.div
                key="results"
                className="grid gap-1.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
              >
                {demoLinks.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.favicon}
                        alt={`${item.title} favicon`}
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GroupsDemo() {
  const groups = [
    { label: "Product Research", count: "12" },
    { label: "UI References", count: "8" },
    { label: "Build Queue", count: "5" },
    { label: "Reading List", count: "6" },
  ];
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setTimeout(() => setDeleteIndex(null), 1600);
  };

  return (
    <div className="w-full grid gap-1.5">
      {groups.map((group, index) => (
        <div
          key={group.label}
          className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-1.5 text-[11px]"
        >
          <span className="font-medium text-foreground">{group.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground/70">
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out hover:bg-background active:scale-[0.97]"
                aria-label="Edit group"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={12} />
              </button>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-lg bg-background/60 text-destructive transition-all duration-200 ease-out hover:bg-destructive/10 active:scale-[0.97]"
                aria-label="Delete group"
                onClick={() => handleDelete(index)}
              >
                <HugeiconsIcon
                  icon={deleteIndex === index ? Alert02Icon : Delete02Icon}
                  size={12}
                />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {group.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function NavigationDemo() {
  return (
    <div className="flex w-full justify-center">
      <div className="grid w-fit grid-cols-3 gap-4 text-[10px] text-muted-foreground/70">
        {[
          { label: "Preview", keys: ["Space"] },
          { label: "Move", keys: ["↑", "↓", "←", "→"] },
          { label: "Copy", keys: ["⏎"] },
          { label: "Open", keys: ["⌘", "⏎"] },
          { label: "Search", keys: ["⌘/Ctrl", "F"] },
          { label: "Cancel", keys: ["Esc"] },
        ].map((shortcut) => (
          <div key={shortcut.label} className="flex flex-col items-center gap-2">
            <KbdGroup className="gap-1">
              {shortcut.keys.map((key) => (
                <Kbd key={key} className="h-[22px] min-w-[22px] px-1 text-[9px]">
                  {key}
                </Kbd>
              ))}
            </KbdGroup>
            <span className="text-[11px] font-semibold text-foreground">
              {shortcut.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewModesDemo() {
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
            className="relative rounded-full px-2 py-1 transition-all duration-200 ease-out active:scale-[0.97]"
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
      <div className="relative h-[120px]">
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
                  className="rounded-2xl bg-muted/30 p-3 ring-1 ring-foreground/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-background">
                      <img
                        src={item.favicon}
                        alt={`${item.title} favicon`}
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
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out active:scale-[0.97]"
                        aria-label="Copy link"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={12} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out active:scale-[0.97]"
                        aria-label="Open link"
                      >
                        <HugeiconsIcon icon={ArrowUpRight03Icon} size={12} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 text-destructive transition-all duration-200 ease-out active:scale-[0.97]"
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
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.favicon}
                      alt={`${item.title} favicon`}
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
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 px-3 py-3 text-xs text-center"
                >
                  <img
                    src={item.favicon}
                    alt={`${item.title} favicon`}
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
