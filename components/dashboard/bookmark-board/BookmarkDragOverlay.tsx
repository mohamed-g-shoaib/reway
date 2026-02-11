"use client";

import { Favicon } from "../Favicon";
import { getDomain } from "@/lib/utils";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface BookmarkDragOverlayProps {
  activeBookmark: BookmarkRow | null;
  viewMode: "list" | "card" | "icon";
}

export function BookmarkDragOverlay({
  activeBookmark,
  viewMode,
}: BookmarkDragOverlayProps) {
  if (!activeBookmark) return null;

  const domain = getDomain(activeBookmark.url);

  if (viewMode === "card") {
    return (
      <div className="relative flex flex-col gap-3 rounded-2xl bg-background/95 ring-1 ring-foreground/8 p-4 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Favicon
            url={activeBookmark.favicon_url || ""}
            domain={domain}
            title={activeBookmark.title || ""}
            className="size-9"
          />
          <div className="min-w-0 flex flex-col">
            <p className="truncate text-sm font-bold text-foreground">
              {activeBookmark.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {domain}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(activeBookmark.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    );
  }

  if (viewMode === "icon") {
    return (
      <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-background/95 ring-1 ring-foreground/8 p-4 text-center after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
        <Favicon
          url={activeBookmark.favicon_url || ""}
          domain={domain}
          title={activeBookmark.title || ""}
          className="size-12"
        />
        <p className="truncate text-xs font-semibold text-foreground w-full">
          {activeBookmark.title}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between rounded-2xl bg-background/95 ring-1 ring-foreground/8 px-4 py-1.5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Favicon
          url={activeBookmark.favicon_url || ""}
          domain={domain}
          title={activeBookmark.title || ""}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-bold text-foreground">
            {activeBookmark.title}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {domain}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center pl-6">
        <span className="text-sm font-medium text-muted-foreground">
          {new Date(activeBookmark.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
