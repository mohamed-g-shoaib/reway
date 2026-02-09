import { createClient } from "./server";
import { Database } from "./database.types";

export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
export type GroupRow = Database["public"]["Tables"]["groups"]["Row"];

export async function getBookmarks() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      "id,url,normalized_url,title,description,favicon_url,og_image_url,image_url,screenshot_url,group_id,user_id,created_at,order_index,folder_order_index,status,is_enriching,last_fetched_at,error_reason",
    )
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
    .select("id,name,icon,color,user_id,created_at,order_index")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching groups:", error.message || error);
    return [];
  }

  return data;
}
