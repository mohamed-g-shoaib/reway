"use client";

import { ColorsIcon, Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DASHBOARD_THEMES, type DashboardPaletteTheme } from "@/lib/themes";

interface ThemeControlsProps {
  paletteTheme: DashboardPaletteTheme;
  setPaletteTheme: (value: DashboardPaletteTheme) => void;
}

export function ThemeControls({
  paletteTheme,
  setPaletteTheme,
}: ThemeControlsProps) {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="inline-flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full transition-transform duration-150 hover:bg-muted/50 active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
                  aria-label="Change dashboard theme"
                >
                  <HugeiconsIcon icon={ColorsIcon} size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-lg font-medium" side="bottom">
                Theme
              </TooltipContent>
            </Tooltip>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-2xl p-2 ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
        >
          {DASHBOARD_THEMES.map((themeOption) => {
            const isActive = paletteTheme === themeOption.value;
            return (
              <DropdownMenuItem
                key={themeOption.value}
                className={`rounded-lg flex items-center gap-2 cursor-pointer ${
                  isActive ? "bg-muted text-foreground font-medium" : ""
                }`}
                onClick={() => setPaletteTheme(themeOption.value)}
              >
                <span
                  className="flex items-center gap-1.5 shrink-0"
                  aria-hidden="true"
                >
                  {themeOption.dots.map((dot) => (
                    <span
                      key={dot}
                      className="size-2.5 rounded-full ring-1 ring-foreground/10"
                      style={{ backgroundColor: dot }}
                    />
                  ))}
                </span>
                <span className="truncate">{themeOption.label}</span>
              </DropdownMenuItem>
            );
          })}

          <div className="my-1 h-px w-full bg-border/40" />

          <DropdownMenuItem
            className="rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={() => setTheme("light")}
          >
            <HugeiconsIcon icon={Sun01Icon} size={14} strokeWidth={2} />
            <span className="truncate">
              Light mode
              {theme === "light" ? " (current)" : ""}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={() => setTheme("dark")}
          >
            <HugeiconsIcon icon={Moon02Icon} size={14} strokeWidth={2} />
            <span className="truncate">
              Dark mode
              {theme === "dark" ? " (current)" : ""}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
