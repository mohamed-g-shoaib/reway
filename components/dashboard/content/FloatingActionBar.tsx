"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FloatingActionBarProps {
  selectedCount: number;
  onOpenSelected: () => void;
  onBulkDelete: () => void;
  onCancelSelection: () => void;
}

export function FloatingActionBar({
  selectedCount,
  onOpenSelected,
  onBulkDelete,
  onCancelSelection,
}: FloatingActionBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none">
        <p className="sr-only" aria-live="polite">
          {selectedCount} selected.
        </p>
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background ring-1 ring-foreground/8 shadow-none isolate after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-white/5 after:pointer-events-none">
          <span className="text-sm font-medium text-foreground tabular-nums">
            {selectedCount} selected
          </span>
          <div className="h-4 w-px bg-border/50" />
          <button
            type="button"
            onClick={onOpenSelected}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
            aria-label="Open selected bookmarks"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none bg-destructive/10 text-destructive hover:bg-destructive/20"
            aria-label="Delete selected bookmarks"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onCancelSelection}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-medium text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none"
            aria-label="Cancel selection"
          >
            Cancel
          </button>
        </div>
      </div>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete selected bookmarks?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the selected bookmarks from your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-4xl">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-4xl"
            onClick={() => {
              onBulkDelete();
              setDeleteDialogOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
