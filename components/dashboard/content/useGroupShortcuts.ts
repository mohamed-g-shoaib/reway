"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GroupRow } from "@/lib/supabase/queries";

interface UseGroupShortcutsOptions {
  groups: GroupRow[];
  setActiveGroupId: (id: string) => void;
}

export function useGroupShortcuts({
  groups,
  setActiveGroupId,
}: UseGroupShortcutsOptions) {
  const letterCycleRef = useRef<Record<string, number>>({});

  const groupsByFirstLetter = useMemo(() => {
    const map: Record<string, string[]> = {};

    const normalizeChar = (char: string): string => {
      return char
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    const allBookmarksFirstLetter = "a";
    if (!map[allBookmarksFirstLetter]) {
      map[allBookmarksFirstLetter] = [];
    }
    map[allBookmarksFirstLetter].push("all");

    for (const group of groups) {
      const groupName = group.name ?? "";
      const firstChar = groupName.trim().charAt(0);
      if (!firstChar) continue;

      const normalizedLetter = normalizeChar(firstChar);
      if (/[a-z]/.test(normalizedLetter)) {
        if (!map[normalizedLetter]) {
          map[normalizedLetter] = [];
        }
        map[normalizedLetter].push(group.id);
      }
    }
    return map;
  }, [groups]);

  useEffect(() => {
    letterCycleRef.current = {};
  }, [groups]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const letter = event.key.toLowerCase();
      const groupIds = groupsByFirstLetter[letter];
      if (!groupIds || groupIds.length === 0) return;

      event.preventDefault();
      const currentIndex = letterCycleRef.current[letter] ?? -1;
      const nextIndex = (currentIndex + 1) % groupIds.length;
      letterCycleRef.current[letter] = nextIndex;
      setActiveGroupId(groupIds[nextIndex]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [groupsByFirstLetter, setActiveGroupId]);
}
