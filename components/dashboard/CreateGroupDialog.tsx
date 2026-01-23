"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroup } from "@/app/dashboard/actions";
import { ICON_CATEGORIES } from "@/lib/hugeicons-list";
import { HugeiconsIcon } from "@hugeicons/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (groupId: string, name: string, icon: string) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("folder");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const groupId = await createGroup({
        name: name.trim(),
        icon: selectedIcon,
      });
      onSuccess?.(groupId, name.trim(), selectedIcon);
      onOpenChange(false);
      setName("");
      setSelectedIcon("folder");
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 rounded-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Create Group
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-[70vh] sm:h-auto"
        >
          <div className="flex-1 overflow-hidden p-6 pt-0 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-muted-foreground ml-1"
              >
                Group Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Design Inspiration, Coding Docs..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border-muted-foreground/10 bg-muted/30 focus-visible:ring-primary/20 h-11"
                autoFocus
              />
            </div>

            <div className="space-y-3 flex flex-col min-h-0">
              <Label className="text-sm font-semibold text-muted-foreground ml-1">
                Select Icon
              </Label>
              <ScrollArea className="h-75 pr-4">
                <div className="space-y-6">
                  {ICON_CATEGORIES.map((category) => (
                    <div key={category.name} className="space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50 ml-1">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                        {category.icons.map(
                          ({ name: iconName, icon: Icon }) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setSelectedIcon(iconName)}
                              title={iconName}
                              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                                selectedIcon === iconName
                                  ? "bg-primary text-primary-foreground scale-105"
                                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              <HugeiconsIcon
                                icon={Icon}
                                size={18}
                                strokeWidth={1.5}
                              />
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border/10 bg-muted/5">
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full rounded-2xl h-11 font-bold transition-all active:scale-[0.98]"
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
