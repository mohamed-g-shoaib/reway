# Implementation Guide: Extension Authentication & Real-time Sync

This guide explains how the Mind Cave extension handles authentication and how it achieves real-time bookmark updates on the dashboard without requiring a page reload.

---

## 1. Extension Authentication Pattern

The extension uses a **session-sharing pattern**. It doesn't implement its own login flow. Instead, it "borrows" the authentication session from the Mind Cave web application.

### How it works

1. **Shared Cookies**: When a user logs into `mindcave.vercel.app`, the browser stores authentication cookies (e.g., Supabase session cookies).
2. **Cross-Origin Fetch**: Chrome extensions with proper `host_permissions` can make `fetch` requests to the application's domain. In Manifest V3, these requests automatically include the cookies for that domain.
3. **API Verification**: The extension calls `/api/categories` or `/api/bookmarks`.
   - If the user is logged in, the server receives the cookies, authenticates the request, and returns the data.
   - If the user is not logged in (cookies missing or expired), the server returns `401 Unauthorized`.

### Implementation Requirements

- **Manifest.json**: Must include the API domain in `host_permissions`.
  ```json
  "host_permissions": [
    "https://mindcave.vercel.app/api/*"
  ]
  ```
- **Client Fetch**: The extension calls the API. While extensions often send cookies automatically for permitted hosts, it's best practice to specify `credentials: 'include'`.
  ```javascript
  async function fetchCategories() {
    const response = await fetch("https://mindcave.vercel.app/api/categories", {
      credentials: "include", // Ensures cookies are sent
    });
    if (response.status === 401) {
      // Show login required UI
    }
    return await response.json();
  }
  ```
- **Server-Side CORS**: The API must allow requests from the extension's origin. You can find your extension ID in `chrome://extensions`.
  - Origin: `chrome-extension://your-extension-id`
  - In Next.js, you might need to configure headers in `next.config.js` or handle OPTIONS requests in your route handlers.

---

## 2. Real-time Dashboard Updates

The "magic" where a bookmark appears immediately on the dashboard happens through **Supabase Realtime Broadcast** triggered by **Database Webhooks**.

### The Full Flow

1. **Action**: Extension sends a `POST` request to `/api/bookmarks`.
2. **Persistence**: The Next.js API route inserts the new bookmark into the `bookmarks` table in Postgres.
3. **Trigger**: A Postgres trigger on the `bookmarks` table detects the `INSERT`.
4. **Broadcast**: The trigger executes a function that calls `realtime.broadcast_changes`. This sends a message to a specific Realtime channel.
5. **Subscription**: The Dashboard web app is subscribed to that specific channel.
6. **Update**: When the Dashboard receives the message, it tells React Query to "invalidate" the bookmarks query, causing an automatic refetch and UI update.

### Implementation Details

#### A. Database Trigger (Postgres)

You need a trigger function that broadcasts changes to a user-specific topic. This ensures only the correct user's dashboard updates.

```sql
-- 1. Create the broadcast function
CREATE OR REPLACE FUNCTION notify_bookmarks_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'user:' || COALESCE(NEW.user_id, OLD.user_id)::text || ':bookmarks', -- Topic
    TG_OP,      -- Event (INSERT, UPDATE, DELETE)
    TG_OP,      -- Payload type
    'bookmarks', -- Schema/Table info
    'public',
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the table
CREATE TRIGGER bookmarks_sync_trigger
AFTER INSERT OR UPDATE OR DELETE ON bookmarks
FOR EACH ROW EXECUTE FUNCTION notify_bookmarks_changes();
```

#### B. Dashboard Subscription (React)

Use a hook to listen for these broadcasts. When an event occurs, invalidate the cache.

```typescript
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useBookmarksRealtime(userId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // 1. Join the user-specific channel
    const channel = supabase.channel(`user:${userId}:bookmarks`, {
      config: { private: true },
    });

    // 2. Set auth for private channel access
    supabase.realtime.setAuth();

    // 3. Listen for broadcast events
    channel
      .on("broadcast", { event: "INSERT" }, () => {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      })
      .on("broadcast", { event: "UPDATE" }, () => {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      })
      .on("broadcast", { event: "DELETE" }, () => {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
```

#### C. Realtime Authorization (RLS)

Supabase requires RLS policies on the `realtime.messages` table to allow users to receive these broadcasts on private channels.

```sql
CREATE POLICY "Users can receive their own bookmark updates"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic = 'user:' || auth.uid()::text || ':bookmarks'
);
```

### Summary for the LLM Agent

- **Auth**: Use `host_permissions` in the extension to send session cookies to the main app's API.
- **Realtime**: Don't use `postgres_changes` (inefficient). Use `broadcast_changes` via a Postgres Trigger.
- **Topic Naming**: Use a granular topic like `user:{id}:bookmarks` for privacy and performance.
- **Cache Invalidation**: Use React Query `invalidateQueries` to bridge the gap between the Realtime event and the UI state.
