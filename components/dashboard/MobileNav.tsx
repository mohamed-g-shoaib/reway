"use client";

import {
  ChevronLeft,
  LayoutGrid,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  return (
    <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background/80 p-2 shadow-2xl backdrop-blur-xl md:hidden">
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
        <Button size="icon" className="h-10 w-10 rounded-full shadow-sm">
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
        <RotateCcw className="h-5 w-5" />
      </Button>
      <div className="mx-1 h-4 w-px bg-border" />
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
