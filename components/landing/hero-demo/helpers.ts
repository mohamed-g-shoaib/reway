import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import type { TodoPriority } from "@/components/dashboard/content/notes-todos/types";
import { NOTE_COLORS } from "@/components/dashboard/content/notes-todos/config";

import type { HeroBookmark, HeroGroupId } from "./types";
import { PREVIEW_BOOKMARKS } from "./data";

const HERO_DEMO_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export type BookmarkSlot =
  | { kind: "bookmark"; value: HeroBookmark }
  | { kind: "placeholder"; key: string };

export function makeHeroDemoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(16).slice(2);
}

export function createInitialHeroBookmarks(): HeroBookmark[] {
  return PREVIEW_BOOKMARKS.map((bookmark, index) => ({
    ...bookmark,
    id: `seed-${index}`,
  }));
}

export function createInitialNotes(): NoteRow[] {
  return [
    {
      id: "n1",
      user_id: "hero",
      text: "Capture pricing pages and docs before you forget where you found them.",
      color: NOTE_COLORS[2],
      created_at: HERO_DEMO_TIMESTAMP,
      updated_at: HERO_DEMO_TIMESTAMP,
      order_index: 0,
    },
    {
      id: "n2",
      user_id: "hero",
      text: "Long notes truncate in the sidebar. Click to expand and collapse just like the dashboard.",
      color: NOTE_COLORS[5],
      created_at: HERO_DEMO_TIMESTAMP,
      updated_at: HERO_DEMO_TIMESTAMP,
      order_index: 1,
    },
  ];
}

export function createInitialTodos(): TodoRow[] {
  return [
    {
      id: "t1",
      user_id: "hero",
      text: "Group similar links",
      priority: "high",
      completed: false,
      created_at: HERO_DEMO_TIMESTAMP,
      updated_at: HERO_DEMO_TIMESTAMP,
      completed_at: null,
      order_index: 0,
    },
    {
      id: "t2",
      user_id: "hero",
      text: "Clean duplicates",
      priority: "medium",
      completed: true,
      created_at: HERO_DEMO_TIMESTAMP,
      updated_at: HERO_DEMO_TIMESTAMP,
      completed_at: HERO_DEMO_TIMESTAMP,
      order_index: 1,
    },
  ];
}

export function filterVisibleHeroBookmarks({
  activeGroup,
  bookmarks,
  commandMode,
  searchQuery,
}: {
  activeGroup: HeroGroupId;
  bookmarks: HeroBookmark[];
  commandMode: "add" | "search";
  searchQuery: string;
}) {
  const groupFiltered =
    activeGroup === "all"
      ? bookmarks
      : bookmarks.filter((bookmark) => bookmark.group === activeGroup);

  const query = (commandMode === "search" ? searchQuery : "")
    .trim()
    .toLowerCase();

  if (!query) return groupFiltered;

  return groupFiltered.filter((bookmark) => {
    return (
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.domain.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query)
    );
  });
}

export function createStableBookmarkSlots(bookmarks: HeroBookmark[], max = 9) {
  const slots: BookmarkSlot[] = bookmarks
    .slice(0, max)
    .map((bookmark) => ({ kind: "bookmark", value: bookmark }));

  while (slots.length < max) {
    slots.push({ kind: "placeholder", key: `ph-${slots.length}` });
  }

  return slots;
}

export function createBookmarkFromCommandInput({
  activeGroup,
  value,
  id,
}: {
  activeGroup: HeroGroupId;
  value: string;
  id: string;
}): HeroBookmark {
  const nextGroup = activeGroup === "all" ? "Research" : activeGroup;

  return {
    id,
    title: value.length > 28 ? `${value.slice(0, 28)}…` : value,
    domain: "new.link",
    url: value.startsWith("http") ? value : `https://${value}`,
    date: "Now",
    favicon: "https://www.google.com/s2/favicons?domain=example.com&sz=64",
    group: nextGroup as Exclude<HeroGroupId, "all">,
  };
}

export function updateTodoCompleted(
  todo: TodoRow,
  completed: boolean,
): TodoRow {
  return {
    ...todo,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

export function updateTodoValues(
  todo: TodoRow,
  formData: { text: string; priority: TodoPriority },
): TodoRow {
  return {
    ...todo,
    text: formData.text,
    priority: formData.priority,
    updated_at: new Date().toISOString(),
  };
}
