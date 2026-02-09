"use client";

import { Favicon } from "../Favicon";
import { getDomain } from "@/lib/utils";
import type { BookmarkRow } from "@/lib/supabase/queries";

interface FolderDragOverlayProps {
  activeBookmark: BookmarkRow | null;
}

export function FolderDragOverlay({ activeBookmark }: FolderDragOverlayProps) {
  if (!activeBookmark) return null;

  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-background/95 ring-1 ring-foreground/8 p-4 text-center after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate overflow-hidden">
      <Favicon
        url={activeBookmark.favicon_url || ""}
        domain={getDomain(activeBookmark.url)}
        title={activeBookmark.title || ""}
        className="size-12"
      />
      <p className="truncate text-xs font-semibold text-foreground w-full">
        {activeBookmark.title}
      </p>
    </div>
  );
}
