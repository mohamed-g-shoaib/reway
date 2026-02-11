import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./database.types";

export const DEMO_GROUP = {
  name: "Getting Started",
  icon: "ZapIcon", // Default icon
  color: "#ea8620", // Orange
};

export const DEMO_BOOKMARKS = [
  {
    url: "https://reway-app.vercel.app/about",
    title: "About Reway",
    description: "Learn why Reway was built and the philosophy behind it.",
    favicon_url: "https://reway-app.vercel.app/favicon.ico",
  },
  {
    url: "https://drive.google.com/file/d/10rypTtZMKT_IR53b5cS7epw7acEoC9WW/view?usp=sharing",
    title: "Download Reway Extension",
    description: "Our extension enables powerful features.",
    favicon_url:
      "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
  },
  {
    url: "https://github.com/mohamed-g-shoaib/reway",
    title: "Source Code on GitHub",
    description: "View the source code and contribute to the project.",
    favicon_url: "https://github.com/favicon.ico",
  },
  {
    url: "https://x.com/devloopsoftware",
    title: "Follow us on X",
    description: "Stay updated with Devloop.",
    favicon_url: "https://x.com/favicon.ico",
  },
];

/**
 * Seeds a new user with default demo data if they haven't been seeded yet.
 * Uses user_metadata to track seeding status across sessions.
 */
export async function seedNewUser(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  try {
    const userId = user.id;
    const hasSeeded = user.user_metadata?.has_seeded;

    // 1. If metadata flag exists, definitively skip
    if (hasSeeded) {
      return;
    }

    // 2. Check for existing groups to determine if user is new or existing
    const { data: userGroups, error: groupsError } = await supabase
      .from("groups")
      .select("id, name")
      .eq("user_id", userId);

    if (groupsError) throw groupsError;

    let targetGroupId: string | null = null;
    const existingGroups = userGroups || [];

    // Check if the specific demo group already exists (recovery scenario)
    const existingDemoGroup = existingGroups.find(
      (g) => g.name === DEMO_GROUP.name,
    );

    if (existingDemoGroup) {
      // Edge Case: Logic crashed after creating group but before adding bookmarks
      // Check if it's empty
      const { count } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("group_id", existingDemoGroup.id);

      if (count === 0) {
        console.log(
          `[Seed] Found empty '${DEMO_GROUP.name}' group. Attempting recovery...`,
        );
        targetGroupId = existingDemoGroup.id;
      } else {
        // Group exists and has content -> Assume fully seeded or user active
        await supabase.auth.updateUser({ data: { has_seeded: true } });
        return;
      }
    } else if (existingGroups.length > 0) {
      // User has OTHER groups -> Existing user -> Skip
      await supabase.auth.updateUser({ data: { has_seeded: true } });
      return;
    } else {
      // 3. True New User (No groups) -> Create "Getting Started" group
      const { data: newGroup, error: createGroupError } = await supabase
        .from("groups")
        .insert({
          name: DEMO_GROUP.name,
          icon: DEMO_GROUP.icon,
          color: DEMO_GROUP.color,
          user_id: userId,
        })
        .select("id")
        .single();

      if (createGroupError) {
        // Handle rare race condition
        if (createGroupError.code === "23505") return;
        throw createGroupError;
      }

      if (!newGroup) return;
      targetGroupId = newGroup.id;
    }

    if (!targetGroupId) return;

    // 4. Add demo bookmarks using the target group ID
    const bookmarksToInsert = DEMO_BOOKMARKS.map((bm, index) => {
      // Normalize URL: remove protocol and trailing slashes for the normalized_url field
      const normalized = bm.url
        .replace(/^https?:\/\//, "") // remove protocol
        .replace(/\/$/, "") // remove trailing slash
        .toLowerCase(); // lowercase for consistency

      return {
        url: bm.url,
        normalized_url: normalized,
        title: bm.title,
        description: bm.description,
        favicon_url: bm.favicon_url,
        group_id: targetGroupId, // Use the determined ID
        user_id: userId,
        status: "ready" as const,
        order_index: index,
      };
    });

    const { error: insertError } = await supabase
      .from("bookmarks")
      .insert(bookmarksToInsert);

    if (insertError) throw insertError;

    // 5. Final step: Flag the user as seeded in their metadata
    // This ensures we never run this logic for this user again.
    await supabase.auth.updateUser({
      data: { has_seeded: true },
    });

    console.log(`[Seed] Successfully seeded user ${userId} with demo data.`);
  } catch (error) {
    console.error("[Seed] Failed to seed user:", error);
    // Note: We don't set the metadata flag on failure, so it can try again next login.
  }
}
