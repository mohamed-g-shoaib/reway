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
import type { TodoRow as TodoRowType } from "@/lib/supabase/queries";
import { normalizePriority, priorityConfig } from "./config";

export function TodoRow({
  todo,
  expanded,
  onToggleExpanded,
  selectionMode,
  selected,
  onToggleSelected,
  onEnterSelectionMode,
  onToggleCompleted,
  onEdit,
  onDelete,
  showActions = true,
}: {
  todo: TodoRowType;
  expanded: boolean;
  onToggleExpanded: () => void;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
  onEnterSelectionMode: () => void;
  onToggleCompleted: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}) {
  const priority = normalizePriority(todo.priority);
  const pCfg = priorityConfig[priority];

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
            <span className={cn("mt-0")}>
              <Checkbox
                checked={selected}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={onToggleSelected}
              />
            </span>
            <span
              className={cn(
                "text-xs font-semibold leading-none",
                pCfg.colorClass,
                "mt-px",
              )}
            >
              {pCfg.letter}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1",
                todo.completed ? "line-through opacity-60" : "",
                expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
              )}
            >
              {todo.text}
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
              onClick={(event) => event.stopPropagation()}
              className={cn("mt-0")}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={onToggleCompleted}
              />
            </span>
            <span
              className={cn(
                "text-xs font-semibold leading-none",
                pCfg.colorClass,
                "mt-0.5",
              )}
            >
              {pCfg.letter}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1",
                todo.completed ? "line-through opacity-60" : "",
                expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
              )}
            >
              {todo.text}
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
              aria-label="Todo options"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-44">
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
              {selectionMode ? "Toggle selection" : "Select todos"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onToggleCompleted}
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
              {todo.completed ? "Mark as active" : "Mark as completed"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onEdit}
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
              Edit todo
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onDelete}
              variant="destructive"
              className="gap-2 text-xs cursor-pointer"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
              Delete todo
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
          {selectionMode ? "Toggle selection" : "Select todos"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onToggleCompleted}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
          {todo.completed ? "Mark as active" : "Mark as completed"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onEdit}
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
          Edit todo
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onDelete}
          variant="destructive"
          className="gap-2 text-xs cursor-pointer"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
          Delete todo
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
