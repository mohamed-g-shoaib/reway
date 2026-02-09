"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICON_CATEGORIES } from "@/lib/hugeicons-list";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColorPicker } from "@/components/ui/color-picker";

export interface IconPickerPopoverProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  color?: string | null;
  onColorChange?: (color: string) => void;
  children: React.ReactNode;
}

export function IconPickerPopover({
  selectedIcon,
  onIconSelect,
  color,
  onColorChange,
  children,
}: IconPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 ring-foreground/8 bg-popover/95 rounded-2xl ring-1 last:relative after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none shadow-none isolate"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/10">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Choose Icon
          </h4>
        </div>
        <ScrollArea className="h-70">
          <div className="p-3 space-y-4">
            {onColorChange ? (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase text-muted-foreground/50 px-1">
                  Color Picker
                </h5>
                <div className="flex items-center gap-3 px-1">
                  <ColorPicker
                    value={color || "#6366f1"}
                    onChange={onColorChange}
                    aria-label="Pick group color"
                    className="h-7 w-7 rounded-full"
                  />
                </div>
              </div>
            ) : null}
            {ICON_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase text-muted-foreground/50 px-1">
                  {category.name}
                </h5>
                <div className="grid grid-cols-7 gap-1.5">
                  {category.icons.map(({ name: iconName, icon: Icon }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-150 ${
                        selectedIcon === iconName
                          ? "bg-primary text-primary-foreground scale-105"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-105"
                      }`}
                    >
                      <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
