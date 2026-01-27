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
    <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-3xl border bg-background/60 p-1.5 backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom-5 duration-500">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
      </Button>

      <div className="flex items-center gap-1 rounded-2xl bg-muted/20 p-0.5">
        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95"
        >
          <HugeiconsIcon icon={GridIcon} size={18} />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={RotateLeft01Icon} size={18} />
      </Button>

      <div className="mx-0.5 h-4 w-px bg-border/40" />

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all active:scale-90"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
      </Button>
    </div>
  );
}
