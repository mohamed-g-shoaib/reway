import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkSquare02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { NoteRow as NoteRowType } from "@/lib/supabase/queries";
import { NOTE_COLORS } from "./config";

export function NoteRow({
  note,
  expanded,
  onToggleExpanded,
  selectionMode,
  selected,
  onToggleSelected,
  onEnterSelectionMode,
  onEdit,
  onDelete,
  showActions = true,
}: {
  note: NoteRowType;
  expanded: boolean;
  onToggleExpanded: () => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
  onEnterSelectionMode: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}) {
  const Row = (
    <div className="group flex items-start gap-3 px-2 py-1.5 rounded-xl transition-colors duration-200 hover:text-primary/90">
      {selectionMode ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onToggleSelected}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggleSelected();
            }
          }}
          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
        >
          <div className={cn("flex gap-2 min-w-0 flex-1", "items-start")}>
            <span className="mt-0.5">
              <Checkbox
                checked={selected}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={onToggleSelected}
              />
            </span>
            <span
              className={cn("h-2 w-2 rounded-full", "mt-1")}
              style={{ backgroundColor: note.color ?? NOTE_COLORS[5] }}
            />
            <span
              className={cn(
                "min-w-0 flex-1",
                expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
              )}
            >
              {note.text}
            </span>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={onToggleExpanded}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggleExpanded();
            }
          }}
          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
        >
          <div className={cn("flex gap-2 min-w-0 flex-1", "items-start")}>
            <span
              className={cn("h-2 w-2 rounded-full", "mt-1")}
              style={{ backgroundColor: note.color ?? NOTE_COLORS[5] }}
            />
            <span
              className={cn(
                "min-w-0 flex-1",
                expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
              )}
            >
              {note.text}
            </span>
          </div>
        </div>
      )}

      {showActions ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer self-start mt-0",
                selectionMode
                  ? "opacity-0 pointer-events-none"
                  : "opacity-0 group-hover:opacity-100 hover:text-primary/90 hover:bg-muted/50",
              )}
              aria-label="Note options"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40">
            <DropdownMenuItem
              onSelect={() => {
                if (selectionMode) {
                  onToggleSelected();
                } else {
                  onEnterSelectionMode();
                }
              }}
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
              {selectionMode ? "Toggle selection" : "Select notes"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onEdit}
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
              Edit note
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onDelete}
              variant="destructive"
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              Delete note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );

  if (!showActions) {
    return Row;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{Row}</ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem
          onSelect={() => {
            if (selectionMode) {
              onToggleSelected();
            } else {
              onEnterSelectionMode();
            }
          }}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
          {selectionMode ? "Toggle selection" : "Select notes"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onEdit}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
          Edit note
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onDelete}
          variant="destructive"
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
          Delete note
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
