import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight03Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  Folder01Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import type { GroupRow } from "@/lib/supabase/queries";

export function GroupRowItem({
  group,
  active,
  selectionMode,
  isSelected,
  onToggleSelected,
  onSelectGroup,
  onEnterSelectionMode,
  onOpenGroup,
  onEnterReorderMode,
  onEdit,
  onRequestDelete,
}: {
  group: GroupRow;
  active: boolean;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelected: () => void;
  onSelectGroup: () => void;
  onEnterSelectionMode: () => void;
  onOpenGroup: () => void;
  onEnterReorderMode: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
}) {
  const GroupIcon = group.icon ? ALL_ICONS_MAP[group.icon] : Folder01Icon;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`group flex items-center gap-3 px-2 py-1.5 transition-colors duration-200 ${
            active
              ? "text-foreground font-semibold"
              : selectionMode
                ? ""
                : "hover:text-primary/90"
          }`}
        >
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
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <span className="h-px w-8 opacity-60 bg-current" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Checkbox
                  checked={isSelected}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={onToggleSelected}
                />
                <span className="truncate max-w-32">{group.name}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSelectGroup}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
            >
              <span
                className={`h-px ${
                  `transition-[width,opacity] duration-200 ease-out ${
                    active
                      ? "w-12 opacity-80"
                      : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                  }`
                } bg-current`}
              />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <HugeiconsIcon
                  icon={GroupIcon || Folder01Icon}
                  size={16}
                  strokeWidth={2}
                  style={{ color: group.color || undefined }}
                  className={group.color ? "" : "text-foreground/80"}
                />
                <span className="truncate max-w-32">{group.name}</span>
              </div>
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer ${
                  selectionMode
                    ? "opacity-0 pointer-events-none"
                    : "opacity-0 group-hover:opacity-100 hover:text-primary/90 hover:bg-muted/50"
                }`}
                aria-label={`${group.name} options`}
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
                    onToggleSelected();
                  }
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                {selectionMode ? "Toggle selection" : "Select groups"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenGroup}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                Open group
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onEnterReorderMode}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={DragDropVerticalIcon} size={14} />
                Reorder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs cursor-pointer">
                <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                Edit group
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onRequestDelete}
                variant="destructive"
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                Delete group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem
          onSelect={() => {
            if (selectionMode) {
              onToggleSelected();
            } else {
              onEnterSelectionMode();
              onToggleSelected();
            }
          }}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
          {selectionMode ? "Toggle selection" : "Select groups"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onOpenGroup} className="gap-2 text-xs cursor-pointer">
          <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
          Open group
        </ContextMenuItem>
        <ContextMenuItem onSelect={onEnterReorderMode} className="gap-2 text-xs cursor-pointer">
          <HugeiconsIcon icon={DragDropVerticalIcon} size={14} />
          Reorder
        </ContextMenuItem>
        <ContextMenuItem onClick={onEdit} className="gap-2 text-xs cursor-pointer">
          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
          Edit group
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onRequestDelete}
          variant="destructive"
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
          Delete group
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
