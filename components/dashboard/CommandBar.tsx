"use client";

import { useRef, useState } from "react";
import { BookmarkRow } from "@/lib/supabase/queries";
import { useIsMac } from "@/hooks/useIsMac";
import { CommandBarInput } from "./command-bar/CommandBarInput";
import { useCommandHandlers } from "./command-bar/useCommandHandlers";
import type { EnrichmentResult } from "./content/dashboard-types";

interface CommandBarProps {
  onAddBookmark: (bookmark: BookmarkRow) => void;
  onApplyEnrichment?: (id: string, enrichment?: EnrichmentResult) => void;
  onReplaceBookmarkId?: (stableId: string, actualId: string) => void;
  activeGroupId: string;
  mode?: "add" | "search";
  searchQuery?: string;
  onModeChange?: (mode: "add" | "search") => void;
  onSearchChange?: (query: string) => void;
  onDuplicatesDetected?: (
    duplicates: { id: string; url: string; title: string }[],
  ) => void;
}

export function CommandBar({
  onAddBookmark,
  onApplyEnrichment,
  onReplaceBookmarkId,
  activeGroupId,
  mode = "add",
  searchQuery = "",
  onModeChange,
  onSearchChange,
  onDuplicatesDetected,
}: CommandBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [isAddBusy, setIsAddBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect OS for keyboard shortcuts
  const isMac = useIsMac();

  const { handleFileChange, handleSubmit } = useCommandHandlers({
    onAddBookmark,
    onApplyEnrichment,
    onReplaceBookmarkId,
    onModeChange,
    onSearchChange,
    onDuplicatesDetected,
    activeGroupId,
    inputRef,
    onAddStatusChange: setAddStatus,
    onAddBusyChange: setIsAddBusy,
  });

  const handleModeChange = (nextMode: "add" | "search") => {
    if (nextMode === mode) return;

    if (nextMode === "search") {
      onSearchChange?.(inputValue);
    } else if (nextMode === "add") {
      setInputValue(searchQuery);
      onSearchChange?.("");
    }

    onModeChange?.(nextMode);
  };

  return (
    <CommandBarInput
      mode={mode}
      searchQuery={searchQuery}
      inputValue={inputValue}
      addStatus={addStatus}
      isAddBusy={isAddBusy}
      isFocused={isFocused}
      isMac={isMac}
      inputRef={inputRef}
      fileInputRef={fileInputRef}
      onModeChange={handleModeChange}
      onSearchChange={onSearchChange}
      onInputValueChange={setInputValue}
      onFocusChange={setIsFocused}
      onSubmit={(e) =>
        handleSubmit(e, mode, inputValue, searchQuery, setInputValue)
      }
      onFileChange={handleFileChange}
      onPlusClick={() => fileInputRef.current?.click()}
    />
  );
}
