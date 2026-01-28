"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Add01Icon,
  Copy01Icon,
  ArrowUpRight03Icon,
  Delete02Icon,
  Alert02Icon,
  PencilEdit01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import type { DashboardHref } from "@/components/landing/types";
import { useState } from "react";

interface HeroSectionProps {
  dashboardHref: DashboardHref;
  ctaLabel: string;
}

const previewBookmarks = [
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
  {
    title: "Figma",
    domain: "figma.com",
    url: "https://www.figma.com",
    date: "Sep 07",
    favicon: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
  },
  {
    title: "Notion",
    domain: "notion.so",
    url: "https://www.notion.so",
    date: "Sep 06",
    favicon: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
  },
  {
    title: "GitHub",
    domain: "github.com",
    url: "https://github.com",
    date: "Sep 03",
    favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64",
  },
];

export function HeroSection({ dashboardHref, ctaLabel }: HeroSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleCopy = async (
    event: React.MouseEvent,
    bookmarkUrl: string,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmarkUrl);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      setCopiedIndex(null);
    }
  };

  const handleOpen = (
    event: React.MouseEvent,
    bookmarkUrl: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(bookmarkUrl, "_blank", "noopener,noreferrer");
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDelete = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setDeleteIndex(index);
    setTimeout(() => setDeleteIndex(null), 2000);
  };

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:pb-20 lg:pt-14">
        <div className="space-y-6 text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            A Calm Home For Everything You Save.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Reway turns noisy links into a structured library. Capture anything in
            seconds, let AI extract what matters, and move fast with search,
            groups, and view modes that match the way you think.
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 rounded-3xl px-6 text-sm font-semibold active:scale-[0.97] transition-all duration-200 ease-out"
          >
            <Link href={dashboardHref}>
              {ctaLabel}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                className="ml-2"
              />
            </Link>
          </Button>
        </div>

        <div
          id="how-it-works"
          className="overflow-hidden rounded-4xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-3 text-foreground">
              <Image
                src="/logo.svg"
                width={18}
                height={18}
                alt="Reway Logo"
                className="dark:invert"
              />
              <span className="text-sm font-semibold">All Bookmarks</span>
            </div>
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://api.dicebear.com/9.x/thumbs/svg?seed=Reway" />
              <AvatarFallback className="bg-secondary text-[10px] text-secondary-foreground">
                RW
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex bg-background">
            <aside className="hidden w-44 shrink-0 flex-col gap-2 border-r border-border bg-muted/30 p-4 text-xs text-muted-foreground sm:flex">
              {[
                { label: "All Bookmarks", active: true },
                { label: "Design" },
                { label: "Research" },
                { label: "Stream" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`flex items-center gap-2 rounded-2xl px-2 py-1 text-[11px] transition-all duration-200 ease-out active:scale-[0.97] ${
                    item.active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-0.5 ${
                      item.active ? "w-10 bg-foreground" : "w-6 bg-muted-foreground/40"
                    }`}
                  />
                  {item.label}
                </button>
              ))}
            </aside>
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <span className="flex size-7 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground">
                    <HugeiconsIcon icon={Add01Icon} size={14} />
                  </span>
                  Insert a link, image, or just search...
                  <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/70">
                    <KbdGroup>
                      <Kbd>{"⌘"}</Kbd>
                      <Kbd>F</Kbd>
                    </KbdGroup>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground/70">
                  <div className="flex items-center gap-1.5">
                    <KbdGroup className="gap-0.5">
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        ↑
                      </Kbd>
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        ↓
                      </Kbd>
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        ←
                      </Kbd>
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        →
                      </Kbd>
                    </KbdGroup>
                    navigate
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Kbd className="h-[18px] min-w-[18px] px-1 text-[9px]">
                      Space
                    </Kbd>
                    preview
                  </div>
                  <div className="flex items-center gap-1.5">
                    <KbdGroup className="gap-0.5">
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        ⌘
                      </Kbd>
                      <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                        ⏎
                      </Kbd>
                    </KbdGroup>
                    open
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Kbd className="h-[18px] min-w-[18px] px-0.5 text-[9px]">
                      ⏎
                    </Kbd>
                    copy
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {previewBookmarks.map((bookmark, index) => (
                    <div
                      key={bookmark.title}
                      className={`rounded-2xl bg-muted/20 p-4 ring-1 ring-foreground/5 transition-colors hover:bg-muted/30 ${
                        index >= 3 ? "hidden lg:block" : ""
                      }`}
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        aria-label={`Open ${bookmark.title}`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-background">
                          <img
                            src={bookmark.favicon}
                            alt={`${bookmark.title} favicon`}
                            className="h-4 w-4"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold leading-tight text-foreground">
                            {bookmark.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground/70">
                            {bookmark.domain}
                          </p>
                        </div>
                      </a>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/70">
                        <span>{bookmark.date}</span>
                        <div className="flex items-center gap-1 text-muted-foreground/70">
                          <button
                            type="button"
                            onClick={handleEdit}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out hover:bg-background active:scale-[0.97]"
                            aria-label="Edit bookmark"
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) =>
                              handleCopy(event, bookmark.url, index)
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out hover:bg-background active:scale-[0.97]"
                            aria-label="Copy link"
                          >
                            <HugeiconsIcon
                              icon={
                                copiedIndex === index ? Tick01Icon : Copy01Icon
                              }
                              size={12}
                              className={
                                copiedIndex === index ? "text-green-500" : ""
                              }
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleOpen(event, bookmark.url)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 transition-all duration-200 ease-out hover:bg-background active:scale-[0.97]"
                            aria-label="Open link"
                          >
                            <HugeiconsIcon icon={ArrowUpRight03Icon} size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleDelete(event, index)}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-background/60 text-destructive transition-all duration-200 ease-out hover:bg-destructive/10 active:scale-[0.97]"
                            aria-label="Delete bookmark"
                          >
                            <HugeiconsIcon
                              icon={
                                deleteIndex === index ? Alert02Icon : Delete02Icon
                              }
                              size={12}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
