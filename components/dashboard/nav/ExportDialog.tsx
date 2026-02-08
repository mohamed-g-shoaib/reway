"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FileExportIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportGroupOptions: string[];
  exportProgress: {
    processed: number;
    total: number;
    status: "idle" | "exporting" | "done" | "error";
  };
  selectedExportGroups: string[];
  onToggleExportGroup: (name: string) => void;
  onExportBookmarks: (groups: string[]) => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  exportGroupOptions,
  exportProgress,
  selectedExportGroups,
  onToggleExportGroup,
  onExportBookmarks,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={FileExportIcon} size={18} />
            Export Bookmarks
          </DialogTitle>
          <DialogDescription>
            Select which groups to export to HTML.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {exportGroupOptions.map((name) => (
              <li key={name}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={selectedExportGroups.includes(name)}
                    onChange={() => onToggleExportGroup(name)}
                  />
                  {name}
                </label>
              </li>
            ))}
          </ul>
          {exportProgress.status !== "idle" ? (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2 w-full origin-left rounded-full bg-primary transition-transform"
                  style={{
                    transform: `scaleX(${exportProgress.total === 0 ? 0 : exportProgress.processed / exportProgress.total})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{exportProgress.status}</span>
                <span>
                  {exportProgress.processed}/{exportProgress.total}
                </span>
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="rounded-4xl"
              onClick={() => onExportBookmarks(selectedExportGroups)}
              disabled={selectedExportGroups.length === 0}
            >
              Export selected
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-4xl"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
