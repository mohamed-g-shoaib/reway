import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NOTE_COLORS } from "./config";
import { ColorPicker } from "./pickers";

export function NoteCreateCard({
  creating,
  setCreating,
  text,
  setText,
  color,
  setColor,
  isCreating,
  onCreate,
}: {
  creating: boolean;
  setCreating: (v: boolean) => void;
  text: string;
  setText: (v: string) => void;
  color: string | null;
  setColor: (v: string) => void;
  isCreating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="pt-3 mt-2 border-t border-border/40">
      {creating ? (
        <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5">
          <div className="space-y-2">
            <ColorPicker value={color} onChange={setColor} />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="New note"
              className="h-8 text-sm rounded-xl"
              autoFocus
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  onCreate();
                } else if (e.key === "Escape") {
                  setCreating(false);
                  setText("");
                  setColor(NOTE_COLORS[5]);
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
                setColor(NOTE_COLORS[5]);
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
          Create note
        </button>
      )}
    </div>
  );
}
