"use client";

import {
  ArrowLeft01Icon,
  GridIcon,
  RotateLeft01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  return (
    <div className="fixed bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-3xl border bg-background/60 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom-5 duration-500">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-4xl hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
      </Button>

      <div className="flex items-center gap-1.5 rounded-2xl bg-muted/20 p-1">
        <Button
          size="icon"
          className="h-11 w-11 rounded-4xl bg-foreground text-background shadow-lg hover:bg-foreground/90 transition-all active:scale-95"
        >
          <HugeiconsIcon icon={GridIcon} size={20} />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-4xl hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={RotateLeft01Icon} size={20} />
      </Button>

      <div className="mx-1 h-5 w-px bg-border/40" />

      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-4xl hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={20} />
      </Button>
    </div>
  );
}
