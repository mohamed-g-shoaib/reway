"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICON_CATEGORIES, getCategoryIcon } from "@/lib/hugeicons-list";
import { HugeiconsIcon } from "@hugeicons/react";

interface IconPickerPopoverProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  children: React.ReactNode;
}

export function IconPickerPopover({
  selectedIcon,
  onIconSelect,
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
        className="w-[320px] p-0 border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/10">
          <h4 className="text-xs font-semibold text-muted-foreground">
            Choose Icon
          </h4>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="p-3 space-y-4">
            {ICON_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                  {category.name}
                </h5>
                <div className="grid grid-cols-7 gap-1.5">
                  {category.icons.map(({ name: iconName, icon: Icon }) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
                        selectedIcon === iconName
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
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
