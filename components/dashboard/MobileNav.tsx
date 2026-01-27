"use client";

import {
  ArrowLeft01Icon,
  GridIcon,
  RotateLeft01Icon,
  MoreHorizontalIcon,
  Home01Icon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MobileNav() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    router.push("/");
  };

  const handleSearch = () => {
    // Focus the command bar input
    const input = document.querySelector('input[aria-label="Search or add bookmarks"]') as HTMLInputElement;
    if (input) {
      input.focus();
    } else {
      toast.error("Search not available");
    }
  };

  const handleMore = () => {
    toast.info("More options coming soon");
  };

  return (
    <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-3xl border bg-background/60 p-1.5 backdrop-blur-2xl md:hidden animate-in slide-in-from-bottom-5 duration-500">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
        onClick={handleBack}
        aria-label="Go back"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
      </Button>

      <div className="flex items-center gap-1 rounded-2xl bg-muted/20 p-0.5">
        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors active:scale-95"
          onClick={handleHome}
          aria-label="Go to dashboard"
        >
          <HugeiconsIcon icon={GridIcon} size={18} />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
        onClick={handleRefresh}
        aria-label="Refresh page"
      >
        <HugeiconsIcon icon={RotateLeft01Icon} size={18} />
      </Button>

      <div className="mx-0.5 h-4 w-px bg-border/40" />

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
        onClick={handleSearch}
        aria-label="Search bookmarks"
      >
        <HugeiconsIcon icon={Search01Icon} size={18} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
        onClick={handleMore}
        aria-label="More options"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
      </Button>
    </div>
  );
}
