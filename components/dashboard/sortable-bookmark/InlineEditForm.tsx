"use client";

import type { RefCallback } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { CSS, type Transform } from "@dnd-kit/utilities";
import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon, GridIcon, Link01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { GroupRow } from "@/lib/supabase/queries";
import { useEffect, useState } from "react";

interface InlineEditFormProps {
  setNodeRef: RefCallback<HTMLDivElement>;
  transform: Transform | null;
  transition?: string | null;
  isDragging: boolean;
  editGroupId: string;
  setEditGroupId: (value: string) => void;
  groups: GroupRow[];
  groupsMap?: Map<string, GroupRow>;
  editTitle: string;
  setEditTitle: (value: string) => void;
  editUrl: string;
  setEditUrl: (value: string) => void;
  editDescription: string;
  setEditDescription: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function InlineEditForm({
  setNodeRef,
  transform,
  transition,
  isDragging,
  editGroupId,
  setEditGroupId,
  groups,
  groupsMap,
  editTitle,
  setEditTitle,
  editUrl,
  setEditUrl,
  editDescription,
  setEditDescription,
  onSave,
  onCancel,
  isSaving,
}: InlineEditFormProps) {
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

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex flex-col rounded-2xl p-3 bg-muted/20 ring-1 ring-foreground/8 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-[''] shadow-none isolate space-y-3 ${
        isDragging ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-transform duration-150 active:scale-95"
              >
                {editGroupId === "no-group" ? (
                  <HugeiconsIcon
                    icon={GridIcon}
                    size={16}
                    className="text-muted-foreground/50"
                  />
                ) : (
                  (() => {
                    const group = groupsMap?.get(editGroupId);
                    const Icon =
                      group?.icon && iconsMap?.[group.icon]
                        ? (iconsMap[group.icon] as typeof GridIcon)
                        : GridIcon;
                    return (
                      <HugeiconsIcon
                        icon={Icon}
                        size={16}
                        className="text-primary"
                      />
                    );
                  })()
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-2xl p-2 ring-1 ring-foreground/8 shadow-none isolate after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none after:content-['']"
            >
              <DropdownMenuItem
                className={`rounded-lg flex items-center gap-2 cursor-pointer ${
                  editGroupId === "no-group"
                    ? "bg-primary/5 text-primary font-bold"
                    : ""
                }`}
                onClick={() => setEditGroupId("no-group")}
              >
                <HugeiconsIcon icon={GridIcon} size={14} />
                No Group
              </DropdownMenuItem>
              {groups.length > 0 ? (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="max-h-60 overflow-y-auto">
                    {groups.map((group) => {
                      const Icon =
                        group.icon && iconsMap?.[group.icon]
                          ? (iconsMap[group.icon] as typeof GridIcon)
                          : GridIcon;
                      return (
                        <DropdownMenuItem
                          key={group.id}
                          className={`rounded-lg flex items-center gap-2 cursor-pointer ${
                            editGroupId === group.id
                              ? "bg-primary/5 text-primary font-bold"
                              : ""
                          }`}
                          onClick={() => setEditGroupId(group.id)}
                        >
                          <HugeiconsIcon icon={Icon} size={14} />
                          <span className="truncate">{group.name}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            className="h-9 flex-1 bg-background/50 border-border/50 rounded-xl text-sm font-bold focus-visible:ring-primary/20"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSave();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/30 border border-dashed border-border/50">
            <HugeiconsIcon
              icon={Link01Icon}
              size={14}
              className="text-muted-foreground/30"
            />
          </div>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="URL"
            className="h-9 flex-1 bg-background/50 border-border/50 rounded-xl text-xs font-medium text-muted-foreground focus-visible:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSave();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/30 border border-dashed border-border/50">
            <HugeiconsIcon
              icon={File02Icon}
              size={14}
              className="text-muted-foreground/30"
            />
          </div>
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (Optional)"
            className="flex-1 bg-background/50 border-border/50 rounded-xl text-xs py-2 min-h-15 resize-none focus-visible:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSave();
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          size="sm"
          variant="secondary"
          className="h-8 px-3 text-xs rounded-4xl font-bold"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-8 px-4 text-xs font-bold rounded-4xl"
          onClick={onSave}
          disabled={!editTitle.trim() || !editUrl.trim() || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
