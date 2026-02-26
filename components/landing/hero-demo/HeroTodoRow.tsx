import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { TodoRow as TodoRowType } from "@/lib/supabase/queries";
import {
  normalizePriority,
  priorityConfig,
} from "@/components/dashboard/content/notes-todos/config";

export function HeroTodoRow({
  todo,
  expanded,
  onToggleExpanded,
  onToggleCompleted,
}: {
  todo: TodoRowType;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleCompleted: () => void;
}) {
  const priority = normalizePriority(todo.priority);
  const pCfg = priorityConfig[priority];

  return (
    <div
      onClick={onToggleExpanded}
      className="group flex items-start gap-3 px-2 py-1.5 rounded-xl transition-all duration-200 hover:text-primary cursor-pointer text-left active:scale-[0.97]"
    >
      <div className="flex gap-2 min-w-0 flex-1 items-start">
        <span
          onClick={(event) => {
            event.stopPropagation();
            onToggleCompleted();
          }}
          className="mt-[0.5px] cursor-pointer"
        >
          <Checkbox
            checked={todo.completed}
            onCheckedChange={onToggleCompleted}
          />
        </span>
        <span
          className={cn(
            "text-xs font-semibold leading-none mt-[2.5px]",
            pCfg.colorClass,
          )}
        >
          {pCfg.letter}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 text-xs",
            todo.completed ? "line-through opacity-60" : "",
            expanded ? "whitespace-pre-wrap wrap-break-word" : "truncate",
          )}
        >
          {todo.text}
        </span>
      </div>
    </div>
  );
}
