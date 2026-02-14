import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TodoPriority } from "./types";
import { PriorityPicker } from "./pickers";

export function TodoCreateCard({
  creating,
  setCreating,
  text,
  setText,
  priority,
  setPriority,
  isCreating,
  onCreate,
}: {
  creating: boolean;
  setCreating: (v: boolean) => void;
  text: string;
  setText: (v: string) => void;
  priority: TodoPriority;
  setPriority: (v: TodoPriority) => void;
  isCreating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="pt-3 mt-2 border-t border-border/40">
      {creating ? (
        <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5">
          <div className="space-y-2">
            <PriorityPicker value={priority} onChange={setPriority} />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="New todo"
              className="h-8 text-sm rounded-xl"
              autoFocus
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  onCreate();
                } else if (e.key === "Escape") {
                  setCreating(false);
                  setText("");
                  setPriority("medium");
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
              onClick={() => {
                setCreating(false);
                setText("");
                setPriority("medium");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
              onClick={onCreate}
              disabled={!text.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary/90 cursor-pointer"
        >
          <HugeiconsIcon icon={Add01Icon} size={14} />
          Create todo
        </button>
      )}
    </div>
  );
}
