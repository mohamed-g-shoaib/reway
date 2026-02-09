"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookmarkRow, GroupRow } from "@/lib/supabase/queries";
import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";
import { GridIcon } from "@hugeicons/core-free-icons";

interface BookmarkEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: BookmarkRow | null;
  groups: GroupRow[];
  onSave: (
    id: string,
    data: {
      title: string;
      url: string;
      description?: string;
      group_id?: string;
    },
  ) => Promise<void>;
}

export function BookmarkEditSheet({
  open,
  onOpenChange,
  bookmark,
  groups,
  onSave,
}: BookmarkEditSheetProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("no-group");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!bookmark) return;
    setTitle(bookmark.title || "");
    setUrl(bookmark.url || "");
    setDescription(bookmark.description || "");
    setGroupId(bookmark.group_id || "no-group");
  }, [bookmark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmark || isSaving) return;

    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(bookmark.id, {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        group_id: groupId === "no-group" ? undefined : groupId,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setIsSaving(false);
    }
  };

  const renderGroupOption = (group: GroupRow) => {
    const Icon = group.icon ? ALL_ICONS_MAP[group.icon] : GridIcon;
    return (
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={Icon} size={14} />
        <span className="truncate">{group.name}</span>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-lg p-0"
      >
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Edit Bookmark</SheetTitle>
          <SheetDescription>Update your bookmark details.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="edit-bookmark-sheet"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-sheet-url">URL *</Label>
              <Input
                id="edit-sheet-url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sheet-title">Title *</Label>
              <Input
                id="edit-sheet-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bookmark title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sheet-description">Description</Label>
              <Textarea
                id="edit-sheet-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label>Group</Label>
              <Select
                value={groupId}
                onValueChange={(value) => setGroupId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-group">No Group</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {renderGroupOption(group)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button form="edit-bookmark-sheet" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
