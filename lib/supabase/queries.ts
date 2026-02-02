import { createClient } from "./server";
import { Database } from "./database.types";

export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
export type GroupRow = Database["public"]["Tables"]["groups"]["Row"];

export async function getBookmarks() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error.message || error);
    return [];
  }

  return data;
}

export async function getGroups() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching groups:", error.message || error);
    return [];
  }

  return data;
}
