"use client";

interface FloatingActionBarProps {
  selectedCount: number;
  bulkDeleteConfirm: boolean;
  onOpenSelected: () => void;
  onBulkDelete: () => void;
  onCancelSelection: () => void;
}

export function FloatingActionBar({
  selectedCount,
  bulkDeleteConfirm,
  onOpenSelected,
  onBulkDelete,
  onCancelSelection,
}: FloatingActionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background border border-border/50 shadow-lg ring-1 ring-foreground/5">
        <span className="text-sm font-medium text-foreground tabular-nums">
          {selectedCount} selected
        </span>
        <div className="h-4 w-px bg-border/50" />
        <button
          type="button"
          onClick={onOpenSelected}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onBulkDelete}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none ${
            bulkDeleteConfirm
              ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
          }`}
        >
          {bulkDeleteConfirm ? "Sure?" : "Delete"}
        </button>
        <button
          type="button"
          onClick={onCancelSelection}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
