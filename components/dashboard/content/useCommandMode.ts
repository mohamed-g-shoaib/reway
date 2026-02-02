"use client";

import { useCallback } from "react";

interface UseCommandModeOptions {
  setCommandMode: (mode: "add" | "search") => void;
  setSearchQuery: (value: string) => void;
}

export function useCommandMode({
  setCommandMode,
  setSearchQuery,
}: UseCommandModeOptions) {
  const handleCommandModeChange = useCallback(
    (mode: "add" | "search") => {
      setCommandMode(mode);
      if (mode === "add") {
        setSearchQuery("");
      }
    },
    [setCommandMode, setSearchQuery],
  );

  return { handleCommandModeChange };
}
