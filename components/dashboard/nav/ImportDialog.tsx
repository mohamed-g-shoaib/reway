"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FileImportIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importPreview: {
    groups: { name: string; count: number; duplicateCount?: number }[];
    entries: {
      title: string;
      url: string;
      groupName: string;
      isDuplicate?: boolean;
      action?: "skip" | "override" | "add";
    }[];
  } | null;
  importProgress: {
    processed: number;
    total: number;
    status: "idle" | "importing" | "done" | "error";
  };
  selectedImportGroups: string[];
  onToggleImportGroup: (name: string) => void;
  onImportFileSelected: (file: File) => void;
  onConfirmImport: (groups: string[]) => void;
  onClearImport: () => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  importPreview,
  importProgress,
  selectedImportGroups,
  onToggleImportGroup,
  onImportFileSelected,
  onConfirmImport,
  onClearImport,
}: ImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={FileImportIcon} size={18} />
            Import Bookmarks
          </DialogTitle>
          <DialogDescription>
            Upload a Netscape bookmarks HTML file to import.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            accept="text/html"
            className="text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await onImportFileSelected(file);
              event.target.value = "";
            }}
          />
          {importPreview ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Import preview</span>
                <span>{importPreview.entries.length} bookmarks</span>
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {importPreview.groups.map((group) => (
                  <li key={group.name}>
                    <label className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={selectedImportGroups.includes(group.name)}
                          onChange={() => onToggleImportGroup(group.name)}
                        />
                        {group.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {group.count}
                        {group.duplicateCount && group.duplicateCount > 0 ? (
                          <span
                            className="text-amber-600"
                            title={`${group.duplicateCount} duplicate${group.duplicateCount > 1 ? "s" : ""}`}
                          >
                            ({group.duplicateCount} dup)
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              {importProgress.status !== "idle" ? (
                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-2 w-full origin-left rounded-full bg-primary transition-transform"
                      style={{
                        transform: `scaleX(${importProgress.total === 0 ? 0 : importProgress.processed / importProgress.total})`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{importProgress.status}</span>
                    <span>
                      {importProgress.processed}/{importProgress.total}
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-4xl"
                  onClick={() => onConfirmImport(selectedImportGroups)}
                  disabled={selectedImportGroups.length === 0}
                >
                  Import selected
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-4xl"
                  onClick={onClearImport}
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Upload a file to preview and select groups.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
