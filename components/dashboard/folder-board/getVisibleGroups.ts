import type { BookmarkRow, GroupRow } from "@/lib/supabase/queries";

export function getVisibleGroups(options: {
  groups: GroupRow[];
  bookmarks: BookmarkRow[];
  activeGroupId: string;
  isFiltered: boolean;
}) {
  const { groups, bookmarks, activeGroupId, isFiltered } = options;

  if (activeGroupId !== "all") {
    return groups.filter((group) => group.id === activeGroupId);
  }

  if (isFiltered) {
    const groupIds = new Set(bookmarks.map((bookmark) => bookmark.group_id ?? "no-group"));
    const filtered = groups.filter((group) => groupIds.has(group.id));
    if (!groupIds.has("no-group")) return filtered;

    return [
      ...filtered,
      {
        id: "no-group",
        name: "No Group",
        icon: "folder",
        color: null,
        user_id: "",
        created_at: new Date().toISOString(),
        order_index: null,
      },
    ];
  }

  const hasUngrouped = bookmarks.some((bookmark) => !bookmark.group_id);
  if (!hasUngrouped) return groups;

  return [
    ...groups,
    {
      id: "no-group",
      name: "No Group",
      icon: "folder",
      color: null,
      user_id: "",
      created_at: new Date().toISOString(),
      order_index: null,
    },
  ];
}
