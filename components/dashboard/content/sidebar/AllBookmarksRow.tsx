import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight03Icon,
  CheckmarkSquare02Icon,
  DragDropVerticalIcon,
  Folder01Icon,
  MoreVerticalIcon,
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

export function AllBookmarksRow({
  active,
  selectionMode,
  reorderMode,
  onSelectAll,
  onOpenAll,
  onEnterReorderMode,
  onToggleSelectionMode,
}: {
  active: boolean;
  selectionMode: boolean;
  reorderMode: boolean;
  onSelectAll: () => void;
  onOpenAll: () => void;
  onEnterReorderMode: () => void;
  onToggleSelectionMode: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`group flex items-center gap-3 px-2 py-1.5 transition-colors duration-200 ${
            active
              ? "text-foreground font-semibold"
              : selectionMode || reorderMode
                ? ""
                : "hover:text-primary/90"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (reorderMode) return;
              onSelectAll();
            }}
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
          >
            <span
              className={`h-px ${
                selectionMode
                  ? "w-8 opacity-60"
                  : `transition-[width,opacity] duration-200 ease-out ${
                      active
                        ? "w-12 opacity-80"
                        : "w-8 opacity-60 group-hover:w-12 group-hover:opacity-80"
                    }`
              } bg-current`}
            />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <HugeiconsIcon
                icon={Folder01Icon}
                size={16}
                strokeWidth={2}
                className="text-muted-foreground"
              />
              <span className="truncate">All Bookmarks</span>
            </div>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer ${
                  selectionMode || reorderMode
                    ? "opacity-0 pointer-events-none"
                    : "opacity-0 group-hover:opacity-100 hover:text-primary/90 hover:bg-muted/50"
                }`}
                aria-label="Group options"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem
                onClick={onOpenAll}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
                Open bookmarks
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onEnterReorderMode}
                className="gap-2 text-xs cursor-pointer"
              >
                <HugeiconsIcon icon={DragDropVerticalIcon} size={14} />
                Reorder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        <ContextMenuItem
          onClick={onOpenAll}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowUpRight03Icon} size={14} />
          Open bookmarks
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onEnterReorderMode}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} size={14} />
          Reorder
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            if (reorderMode) return;
            onToggleSelectionMode();
          }}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
          {selectionMode ? "Exit selection" : "Select groups"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
