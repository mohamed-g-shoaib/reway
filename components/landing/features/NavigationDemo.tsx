"use client";

import { Kbd, KbdGroup } from "@/components/ui/kbd";

export function NavigationDemo() {
  return (
    <div className="flex w-full justify-center">
      <div className="grid w-fit grid-cols-3 gap-4 text-[10px] text-muted-foreground">
        {[
          { label: "Switch Group", keys: ["Shift", "A–Z"] },
          { label: "Move", keys: ["↑", "↓", "←", "→"] },
          { label: "Open", keys: ["⌘/Ctrl", "⏎"] },
          { label: "Preview", keys: ["Space"] },
          { label: "Bulk Delete", keys: ["Shift", "Click"] },
          { label: "Copy", keys: ["⏎"] },
        ].map((shortcut) => (
          <div
            key={shortcut.label}
            className="flex flex-col items-center gap-2"
          >
            <KbdGroup className="gap-1">
              {shortcut.keys.map((key) => (
                <Kbd
                  key={key}
                  className="h-[22px] min-w-[22px] px-1 text-[9px]"
                >
                  {key}
                </Kbd>
              ))}
            </KbdGroup>
            <span className="text-[11px] font-semibold text-foreground">
              {shortcut.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
