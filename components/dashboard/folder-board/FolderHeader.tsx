"use client";

import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AccordionTrigger } from "@/components/ui/accordion";
import type { GroupRow } from "@/lib/supabase/queries";
import { useEffect, useMemo, useState } from "react";

interface FolderHeaderProps {
  group: GroupRow;
  count: number;
  tintLevel?: "off" | "low" | "medium" | "high";
  isSelected: boolean;
  onSelect: () => void;
}

export function FolderHeader({
  group,
  count,
  tintLevel = "medium",
  isSelected,
  onSelect,
}: FolderHeaderProps) {
  const [iconsMap, setIconsMap] = useState<Record<string, IconSvgElement> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    import("@/lib/hugeicons-list")
      .then((mod) => {
        if (cancelled) return;
        setIconsMap(mod.ALL_ICONS_MAP as Record<string, IconSvgElement>);
      })
      .catch(() => {
        if (cancelled) return;
        setIconsMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const Icon = group.icon ? (iconsMap?.[group.icon] ?? Folder01Icon) : Folder01Icon;

  const tintRgb = useMemo(() => {
    const value = group.color?.trim();
    if (!value) return null;
    if (!value.startsWith("#")) return null;

    const hex = value.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    if (normalized.length !== 6) return null;

    const int = Number.parseInt(normalized, 16);
    if (Number.isNaN(int)) return null;

    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `${r} ${g} ${b}`;
  }, [group.color]);

  const tintAlpha = useMemo(() => {
    if (tintLevel === "off") return null;
    if (tintLevel === "low") {
      return { base: 0.08, hover: 0.12, darkBase: 0.06, darkHover: 0.08 };
    }
    if (tintLevel === "high") {
      return { base: 0.14, hover: 0.20, darkBase: 0.10, darkHover: 0.12 };
    }
    return { base: 0.11, hover: 0.16, darkBase: 0.08, darkHover: 0.10 };
  }, [tintLevel]);

  return (
    <AccordionTrigger
      className={`group relative overflow-hidden flex w-full items-center justify-between gap-3 px-4 py-3 text-left border-0 rounded-t-3xl rounded-b-3xl aria-expanded:rounded-b-none aria-expanded:border-b aria-expanded:border-border/30 hover:no-underline ${
        isSelected ? "ring-1 ring-primary/20" : ""
      }`}
      style={
        tintRgb
          ? ({
              ["--folder-tint" as string]: tintRgb,
            } as React.CSSProperties)
          : undefined
      }
      onClick={onSelect}
      aria-label={`Toggle ${group.name}`}
      data-slot="folder-header"
    >
      <div
        className={`absolute -inset-px pointer-events-none rounded-[inherit] ${
          tintRgb && tintAlpha
            ? "bg-[rgb(var(--folder-tint)/var(--folder-tint-a))] dark:bg-[rgb(var(--folder-tint)/var(--folder-tint-a-dark))] group-hover:bg-[rgb(var(--folder-tint)/var(--folder-tint-a-hover))] dark:group-hover:bg-[rgb(var(--folder-tint)/var(--folder-tint-a-dark-hover))]"
            : "bg-muted/15 group-hover:bg-muted/20"
        } ${isSelected ? "opacity-95" : ""}`}
        style={
          tintRgb && tintAlpha
            ? ({
                ["--folder-tint-a" as string]: String(tintAlpha.base),
                ["--folder-tint-a-hover" as string]: String(tintAlpha.hover),
                ["--folder-tint-a-dark" as string]: String(tintAlpha.darkBase),
                ["--folder-tint-a-dark-hover" as string]: String(
                  tintAlpha.darkHover,
                ),
              } as React.CSSProperties)
            : undefined
        }
      />
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <HugeiconsIcon
            icon={Icon}
            size={18}
            strokeWidth={1.8}
            style={{ color: group.color || undefined }}
            className={group.color ? "" : "text-foreground/80"}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {group.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AccordionTrigger>
  );
}
