## Dashboard flow map (so the audit is “connected”, not superficial)

### Route + auth gate

- **Entry**: `app/dashboard/page.tsx`
- **Auth guard**: `app/dashboard/layout.tsx` calls `supabase.auth.getUser()` and `redirect("/login")` if missing user.
- **Initial data load (server)**: `DashboardPage` does:
  - `Promise.all([getUser(), getBookmarks(), getGroups()])`
  - Then renders `components/dashboard/DashboardContent.tsx`

### Data layer (server reads)

- **Bookmarks & groups read helpers**: `lib/supabase/queries.ts`
  - `getBookmarks()` -> `.from("bookmarks").select("*").order("order_index")...`
  - `getGroups()` -> `.from("groups").select("*").order("name")...`
- **Writes / mutations**: via Next.js **server actions**
  - `app/dashboard/actions/bookmarks.ts`
  - `app/dashboard/actions/groups.ts`
  - `app/dashboard/actions/account.ts`

### Client runtime

- **Main state container**: `components/dashboard/DashboardContent.tsx`
  - Holds `bookmarks`, `groups`, `activeGroupId`, view mode, selection mode, etc.
  - Uses hooks:
    - `useDashboardRealtime` (Supabase Realtime broadcast channels)
    - `useBookmarkActions` (optimistic add/edit/delete/reorder + server calls)
    - `useGroupActions` (create/update/delete groups + bookmark adjustments)
    - `useImportHandlers` / `useExportHandlers`
    - `useDashboardDerived` (filtering + group counts)

### External integration path (browser extension API)

- **Extension routes** (service-role / admin client):
  - `app/api/extension/bookmarks/route.ts`
  - `app/api/extension/groups/route.ts`
- They use:
  - `createClient()` to authenticate _the caller_
  - `supabaseAdmin` (service role) to read/write DB and broadcast realtime updates.

---

# Findings by documentation area

## 1) Supabase / Postgres best practices (query, security/RLS, data access)

### Critical: Authorization / RLS-dependent writes without `user_id` scope

If RLS is ever misconfigured/disabled, these become **cross-tenant write primitives**.

- **Bookmark delete doesn’t scope to user**
  - **File**: `app/dashboard/actions/bookmarks.ts`
  - **Snippet**
    - `await supabase.from("bookmarks").delete().eq("id", id);`
  - **Why it matters**
    - This relies entirely on RLS to prevent deleting other users’ bookmarks.
  - **Concrete fix**
    - Fetch user and add `.eq("user_id", userId)` (like your group delete does), or use `.match({ id, user_id })`.

  - **Status**: Fixed
  - **Change**: `deleteBookmark` now fetches the authenticated user and scopes delete by both `id` and `user_id`.
  - **Test**: In the dashboard, delete a bookmark. Confirm it disappears immediately and stays deleted after refresh. Then try deleting again from another tab/session after sign-out/sign-in (should either be unauthorized or no-op, not delete other users’ data).

- **Bookmark enrichment update doesn’t scope to user**
  - **File**: `app/dashboard/actions/bookmarks.ts`
  - **Snippet**
    - `await supabase.from("bookmarks").update({...}).eq("id", id);`
  - **Why it matters**
    - Same issue: a write by `id` alone is unsafe if RLS isn’t airtight.
  - **Concrete fix**
    - Add user scoping: `.eq("id", id).eq("user_id", userId)` after verifying auth.

  - **Status**: Fixed
  - **Change**: `enrichCreatedBookmark` now checks auth and scopes updates by both `id` and `user_id` (success and failure paths).
  - **Test**: Add a new bookmark (so it starts as `pending`). Wait for enrichment to complete. Confirm the bookmark transitions to `ready` (or `failed`) and metadata updates still appear.

- **Bookmark `enrichBookmark` update doesn’t scope to user**
  - **File**: `app/dashboard/actions/bookmarks.ts`
  - **Snippet**
    - `.from("bookmarks").update({ ...metadata }).eq("id", id)`
  - **Fix**
    - Same: add auth + `.eq("user_id", userId)`.

  - **Status**: Fixed
  - **Change**: `enrichBookmark` now checks auth and scopes update by both `id` and `user_id`.
  - **Test**: Trigger any UI path that calls `enrichBookmark` (e.g., a manual refresh/enrich action if present). Confirm the update still applies, and no errors appear in the console.

By contrast, **groups** server actions _do_ scope properly:

- `app/dashboard/actions/groups.ts` uses `.eq("id", id).eq("user_id", userId)` for update/delete.
- `checkDuplicateGroup(name, excludeId?)` supports excluding the group being edited so icon-only updates don’t fail the duplicate-name check.

### High: `select("*")` and over-fetching in dashboard reads

- **File**: `lib/supabase/queries.ts`
- **Snippets**
  - `from("bookmarks").select("*")`
  - `from("groups").select("*")`
- **Why it matters (Postgres + network + React render cost)**
  - Over-fetching increases payload size, serialization, and client-side work (especially when bookmarks grow).
- **Concrete fix**
  - Select only columns needed for dashboard views (list/card/icon/folders + edit/preview). Example: `select("id,title,url,description,group_id,order_index,folder_order_index,created_at,status,favicon_url,image_url,og_image_url,last_fetched_at,error_reason")`.

- **Status**: Fixed
- **Change**: Updated `lib/supabase/queries.ts` to select an explicit column list for `getBookmarks()` and `getGroups()` (and included `screenshot_url` to match the generated DB types).

### High: DB/RLS/indexes verified via Supabase MCP (but still missing as code in repo)

- **Repo observation**
  - I searched for `supabase/migrations`, `supabase.toml`, `*.sql`, `schema.sql` in the workspace and found **none**.
  - This is still a _process risk_ (schema/policies not versioned alongside app code).
- **Supabase MCP verified state (project: Reway)**
  - **RLS enabled** on `public.bookmarks` and `public.groups`.
  - **Policies present** (both tables):
    - `SELECT`: `auth.uid() = user_id`
    - `INSERT`: `with_check auth.uid() = user_id`
    - `UPDATE`: `auth.uid() = user_id`
    - `DELETE`: `auth.uid() = user_id`
    - Policies are attached to roles `{public}`.
  - **Indexes present**:
    - `bookmarks_user_id_idx` on `(user_id)`
    - `bookmarks_group_id_idx` on `(group_id)`
    - `bookmarks_status_idx` on `(status)`
    - `groups_user_id_idx` on `(user_id)`
    - `groups_user_id_name_idx` unique on `(user_id, lower(trim(name)))` (this matches your duplicate-name behavior and the `23505` handling).
  - **Realtime publication**:
    - Both `bookmarks` and `groups` are published in `supabase_realtime`.
- **Why it matters**
  - The earlier “RLS-dependent write” findings are **still important** because they’re a defense-in-depth concern; however, with the current policies, cross-tenant deletes/updates _should_ be blocked.
  - Missing schema-as-code makes it harder to reproduce and review security/perf changes.
- **Concrete fix**
  - Check in Supabase migrations/policy definitions (or an equivalent authoritative schema definition) so changes are reviewable.

### High: Missing uniqueness/indexing for `bookmarks` duplicates + ordering (scaling risk)

- **Evidence**
  - Previously there was **no** unique index for bookmarks on `(user_id, normalized_url)`.
  - Your code performs duplicate detection in `checkDuplicateBookmark(s)` using `normalized_url`, but duplicates can still be inserted concurrently without a DB constraint.
  - The common dashboard query pattern is effectively `where user_id = auth.uid() order by order_index, created_at desc` (current plan uses `bookmarks_user_id_idx` + sort).
- **Why it matters**
  - Without a unique constraint, “duplicate prevention” is best-effort and can race.
  - Without a composite index, ordering may require sorting more rows as data grows.
- **Concrete fix**
  - Add a unique index (or constraint) on `bookmarks(user_id, normalized_url)` (possibly on `lower(normalized_url)` if needed).
  - Consider a composite index aligned to the main listing query, e.g. `(user_id, order_index, created_at desc)` (exact shape depends on your null handling and query patterns).

- **Status**: Fixed
- **Change** (applied via Supabase MCP)
  - Added non-unique indexes:
    - `bookmarks_user_id_normalized_url_idx` on `(user_id, normalized_url)`
    - `bookmarks_user_id_group_id_order_index_idx` on `(user_id, group_id, order_index)`
    - `bookmarks_user_id_group_id_folder_order_index_idx` on `(user_id, group_id, folder_order_index)`
  - Added unique index:
    - `bookmarks_user_id_normalized_url_unique` on `(user_id, normalized_url)`
  - Verified there are no remaining duplicate `(user_id, normalized_url)` pairs.
- **Test**: Try importing/adding the same URL twice for the same user (normalized to the same value). Confirm the second insert is rejected (or handled gracefully by the app) and no duplicates appear in the dashboard.

### Medium: Extension API uses service-role but does not validate some integrity constraints

- **File**: `app/api/extension/bookmarks/route.ts`
- **Snippet**
  - Inserts `group_id: payload.groupId ?? null` with `supabaseAdmin`
- **Why it matters**
  - A user can provide a `groupId` that belongs to another user or doesn’t exist.
  - Even if not exploitable for data access, it can create inconsistent rows / foreign key errors (depending on FK).
- **Concrete fix**
  - Validate `payload.groupId` belongs to `userId` (query `groups` by `id` + `user_id`) before insert.

- **Status**: Fixed
- **Change**: `app/api/extension/bookmarks/route.ts` now validates `payload.groupId` belongs to the authenticated user before insert.

### Medium: Realtime broadcasting pattern is OK but assumes channel naming security

- You use `private: true` channels named `user:${userId}:bookmarks` / `groups`.
- **Why it matters**
  - Security depends on Realtime private channel auth being correct and `setAuth()` being valid on client.
- **Concrete fix**
  - Ensure server-side Realtime is configured and policies prevent unauthorized private-channel subscribe. (Can’t verify without Supabase config/policies checked in.)

- **Status**: Deferred
- **Reason**: Requires Supabase Realtime config/policies review (not present as code in repo).

### Low-Medium: Supabase advisors warning (security hygiene)

- **Finding (Supabase Advisors)**
  - Leaked password protection is disabled in Supabase Auth.
- **Why it matters**
  - It allows compromised passwords that appear in breach corpuses.
- **Concrete fix**
  - Enable leaked password protection in Supabase Auth settings.

- **Status**: Not applicable
- **Reason**: This app uses Google sign-in only (no email/password auth).

---

## 2) React / Next performance best practices

### Good patterns already present

- **No waterfall on initial dashboard load**
  - `app/dashboard/page.tsx` uses `Promise.all([...])`.
- **Derived computations memoized**
  - `useDashboardDerived` uses `useMemo` for filtering and counts.
- **Dynamic import used for heavy UI**
  - `IconPickerPopover` is dynamically imported with `ssr: false`.

### High: Likely bundle bloat from huge icon map imported in key dashboard components

- **Files**
  - `components/dashboard/DashboardContent.tsx`
  - `components/dashboard/nav/GroupMenu.tsx`
- **Snippets**
  - `import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";`
- **Why it matters**
  - A large static map included in the default dashboard client bundle increases JS parse/exec time.
- **Concrete fix**
  - Lazy-load icon map only when icon picker/menu is opened (dynamic import), or split icon picker into a separate chunk that owns the map.

- **Status**: Fixed
- **Change**: `ALL_ICONS_MAP` is no longer statically imported by the default dashboard UI. It is now loaded via `import("@/lib/hugeicons-list")` only when needed.
- **Files**:
  - `components/dashboard/content/DashboardSidebar.tsx`
  - `components/dashboard/nav/GroupMenu.tsx`
  - `components/dashboard/BookmarkEditSheet.tsx`
  - `components/dashboard/GroupListItem.tsx`
  - `components/dashboard/InlineGroupCreator.tsx`
  - `components/dashboard/sortable-bookmark/InlineEditForm.tsx`
  - `components/dashboard/folder-board/FolderHeader.tsx`
- **Additional correctness fix**: All group icon fallbacks now default to `Folder01Icon` (desktop sidebar + mobile group menu) when a group has no icon or the icon map hasn’t loaded yet.
- **Test**: Load `/dashboard` and use the UI normally without opening any group/bookmark edit UIs. Then open group edit/icon picker and open the bookmark edit sheet. Confirm icons still render and no runtime errors occur.

### Medium: BookmarkEditSheet imports the full icon map (bundle cost)

- **File**: `components/dashboard/BookmarkEditSheet.tsx`
- **Snippet**
  - `import { ALL_ICONS_MAP } from "@/lib/hugeicons-list";`
- **Why it matters**
  - The sheet is opened less frequently but still ships the icon map to clients.
- **Concrete fix**
  - Lazy-load the icon map or render group labels without icons in the select, or move icon rendering into a dynamically loaded component.

- **Status**: Fixed
- **Change**: `components/dashboard/BookmarkEditSheet.tsx` now loads the icon map dynamically only while the sheet is open.
- **Test**: Open Edit Bookmark sheet and confirm the group select renders icons correctly.

### Medium: Default props creating new objects each render (avoidable churn)

- **Files**
  - `components/dashboard/BookmarkBoard.tsx`
  - `components/dashboard/FolderBoard.tsx`
- **Snippets**
  - `selectedIds = new Set()` in props destructuring
- **Why it matters**
  - Creates a new `Set` every render if parent doesn’t provide `selectedIds`, which can defeat memoization in children and cause subtle re-render churn.
- **Concrete fix**
  - Default to `undefined` and handle with a stable value inside (`useMemo(() => new Set(), [])`) or require parent always passes `selectedIds`.

- **Status**: Fixed
- **Change**:
  - `components/dashboard/BookmarkBoard.tsx`: removed `selectedIds = new Set()` default and replaced with a stable `stableSelectedIds` derived via `useMemo`.
  - `components/dashboard/FolderBoard.tsx`: removed `selectedIds = new Set()` default and replaced with a stable `stableSelectedIds` derived via `useMemo`.
- **Test**: Use selection mode (select/deselect bookmarks) in list/card/icon/folders views. Confirm selection state remains correct and no console errors occur.

### Medium: Client-side mapping does per-item date formatting eagerly

- **File**: `components/dashboard/BookmarkBoard.tsx`
- **Snippet**
  - `createdAt: new Date(b.created_at).toLocaleDateString(...)` inside `useMemo`.
- **Why it matters**
  - For large bookmark lists, this is CPU work every time `bookmarks` changes.
- **Concrete fix**
  - Consider formatting on-demand in row rendering, or caching formatted strings by `(id, created_at)` if needed at scale.

### Medium: Export generation does repeated linear lookups + frequent progress state updates

- **File**: `components/dashboard/content/useExportHandlers.ts`
- **Evidence**
  - For each bookmark, it resolves group name via `groups.find((g) => g.id === bookmark.group_id)` (linear scan).
  - Inside `groupNames.forEach`, it calls `setExportProgress(...)` for each group.
- **Why it matters**
  - `groups.find` per bookmark is O(bookmarks \* groups) and can become noticeable as data grows.
  - Frequent state updates in tight loops can cause extra renders.
- **Concrete fix**
  - Precompute a `Map<groupId, groupName>` once.
  - Batch progress updates (e.g., update every N groups or only at the end).

- **Status**: Fixed
- **Change**: `components/dashboard/content/useExportHandlers.ts` now precomputes `groupNameById` and batches progress updates (every 10 groups / at end).

### Medium: Import performs unbounded parallel writes/enrichment

- **File**: `components/dashboard/content/useImportHandlers.ts`
- **Evidence**
  - Uses `await Promise.all(addPromises)` where each promise does `addBookmark` (server action) then `enrichCreatedBookmark` (server action + network fetch).
- **Why it matters**
  - Large imports can spike concurrency, hitting rate limits/timeouts and degrading UX.
- **Concrete fix**
  - Throttle concurrency (run N at a time), and/or offload enrichment to a background job/queue.

- **Status**: Fixed
- **Change**: `components/dashboard/content/useImportHandlers.ts` now throttles import concurrency (batching with `CONCURRENCY = 5`).

---

## 3) Metadata rules (correctness, defaults, noindex/canonical/social)

### Critical: Private dashboard page is indexable by default

- **File**: `app/dashboard/page.tsx`
- **Snippet**
  - `export const metadata = { title: "Dashboard", description: "..." }`
- **Why it matters**
  - Your dashboard is authenticated/private. Per metadata rules, private/utility pages should generally be **noindex** to avoid accidental indexing.
- **Concrete fix**
  - Add `robots: { index: false, follow: false }` (or equivalent in your Next metadata pattern).
  - Optionally ensure canonical points to the intended URL if you do allow indexing elsewhere.

- **Status**: Fixed
- **Change**: Added `robots: { index: false, follow: false }` to `app/dashboard/page.tsx` metadata.

### High: Metadata exists only on this page (inconsistent coverage)

- Grep for `export const metadata` / `generateMetadata` found only `app/dashboard/page.tsx`.
- **Why it matters**
  - Rules call for deterministic defaults for every page. If other routes exist (login, landing, etc.), they may have missing title/description/canonical.
- **Concrete fix**
  - Establish a consistent pattern (layout defaults + per-page overrides) without introducing new SEO libraries.

### Medium: Social cards/canonical not set (may be acceptable for dashboard)

- For a private dashboard, OG/Twitter tags aren’t very valuable, but you should ensure:
  - it doesn’t accidentally produce conflicting/duplicate metadata
  - it’s explicitly non-indexable

---

## 4) Accessibility (names, keyboard access, focus/dialogs, semantics, forms)

### Critical/High: Icon-only buttons missing accessible names (several places)

You sometimes do this correctly (e.g. `aria-label="Close dialog"` in `QuickGlanceDialog`), but not consistently.

- **QuickGlanceDialog edit/delete icon buttons were missing aria-label**
  - **File**: `components/dashboard/QuickGlanceDialog.tsx`
  - **Snippets**
    - `<Button ... onClick={() => onEdit(bookmark)}>` (icon only)
    - `<Button ... onClick={handleDelete} title="Delete">` (title is not a reliable accessible name)
  - **Why it matters**
    - Screen readers need an accessible name; `title` is inconsistent and not sufficient.
  - **Concrete fix**
    - Add `aria-label="Edit bookmark"` / `aria-label="Delete bookmark"` (and confirm-delete label) to those `Button`s.

  - **Status**: Fixed
  - **Change**: Added explicit `aria-label` values for edit/delete buttons (including confirm-delete state).

### High: “Clickable div/span” semantics appear in bookmark cards/icons

- **File**: `components/dashboard/SortableBookmarkCard.tsx`
- **Snippet**
  - Previously a clickable wrapper was flagged; the favicon/open behavior now uses a native `<button type="button">`.
- **Why it matters**
  - Rule: prefer native elements. Clickable `div` lacks keyboard activation by default.
- **Concrete fix**
  - Replace with `<button type="button">` or `<a href=... target=... rel=...>` (best if it navigates).

- **Status**: Fixed
- **Change**: Converted open interactions to native `button` elements and added `aria-label="Open bookmark"`.

### High: `SortableBookmark` uses `role="button"` on a `div` without full keyboard support

- **File**: `components/dashboard/SortableBookmark.tsx`
- **Evidence**
  - The draggable row is a `div` with `role="button"` and `tabIndex={status === "pending" ? -1 : 0}`.
  - There is no explicit `onKeyDown` handler to activate the primary action (open/copy/preview) via Enter/Space.
- **Why it matters**
  - A `div` with `role="button"` should implement expected keyboard interactions.
- **Concrete fix**
  - Prefer native elements (`button`/`a`) for the primary action region, or implement `onKeyDown` for Enter/Space and ensure focus/activation is consistent.

- **Status**: Fixed
- **Change**: Keyboard activation is handled centrally by the global keyboard navigation hooks, and the per-row `onKeyDown` handler was removed to prevent double-triggering (Space previews only, Enter copies only unless Ctrl/Cmd+Enter opens).

### Critical: Incorrect `aria-pressed` usage in Command Bar mode toggle

- **File**: `components/dashboard/command-bar/CommandBarInput.tsx`
- **Snippet**
  - The “Add bookmarks” mode button includes `aria-pressed` with no value.
- **Why it matters**
  - `aria-pressed` must reflect the actual toggle state (`true`/`false`). As written, it will be interpreted as always true and misreport state to assistive tech.
- **Concrete fix**
  - Set `aria-pressed={mode === "add"}` on the Add button, and add `aria-pressed={mode === "search"}` on the Search button.

- **Status**: Fixed
- **Change**: Updated `components/dashboard/command-bar/CommandBarInput.tsx` so both mode buttons correctly set `aria-pressed`.

### High: Import/Export dialogs use unlabeled file input + non-semantic progress indicator

- **Files**
  - `components/dashboard/nav/ImportDialog.tsx`
  - `components/dashboard/nav/ExportDialog.tsx`
- **Snippets**
  - Import: `<Input type="file" ... />` without an associated `<Label>`.
  - Both dialogs: progress is a styled `<div>` with `transform: scaleX(...)`.
- **Why it matters**
  - File inputs should have a programmatic label.
  - Progress should be exposed via `role="progressbar"` and `aria-valuenow/aria-valuemin/aria-valuemax` or an accessible text alternative announced via `aria-live`.
- **Concrete fix**
  - Add a `<Label htmlFor>` + `id` for the file input (or at least `aria-label`).
  - Add `role="progressbar"` and aria value attributes to the progress bar, and/or add a `sr-only` status line in an `aria-live="polite"` region.

- **Status**: Fixed
- **Change**:
  - `components/dashboard/nav/ImportDialog.tsx`: added `Label` + `id`, progressbar semantics, and sr-only `aria-live` status.
  - `components/dashboard/nav/ExportDialog.tsx`: added progressbar semantics and sr-only `aria-live` status.

### Medium: Global keyboard navigation may interfere with dialogs/menus

- **Files**
  - `components/dashboard/bookmark-board/useBookmarkKeyboardNav.ts`
  - `components/dashboard/folder-board/useFolderKeyboardNav.ts`
- **Evidence**
  - Both hooks attach global key handlers (`useGlobalKeydown`) and respond to Arrow keys, Space, Enter, Escape.
  - They only ignore events when the target is an input/textarea/select/contentEditable.
- **Why it matters**
  - When focus is inside a dialog/menu on non-input elements, global handlers can hijack keyboard navigation.
- **Concrete fix**
  - Suppress global handlers when any modal/menu is open (e.g., based on app state), or only enable keyboard nav when a specific board container has focus.

- **Status**: Fixed
- **Change**: Updated both keyboard nav hooks to ignore key events when:
  - focus is inside dialog/dropdown/context-menu/popover content
  - focus is on interactive controls like buttons/links (prevents Enter/Space double-trigger)
  - Files:
    - `components/dashboard/bookmark-board/useBookmarkKeyboardNav.ts`
    - `components/dashboard/folder-board/useFolderKeyboardNav.ts`

### Medium: Dialogs seem OK but verify focus management in UI primitives

- You use shadcn/Radix-style `Dialog`, `AlertDialog`, `DropdownMenu`, `Accordion`.
- These are usually good for focus trapping and Escape handling **if used correctly**.
- **Risk**
  - Any custom close buttons / disabled close behavior (e.g., `showCloseButton={false}`) can accidentally remove an obvious close affordance for keyboard users (you do provide a close button, which is good).
- **Recommendation**
  - Confirm:
    - initial focus inside dialogs
    - Escape closes
    - focus returns to trigger

### Medium: Loading/error announcements

- I see toast usage (`sonner`) for errors, deletes, etc.
- **Why it matters**
  - Toasts must not be the only way to convey critical info (and should be accessible themselves).
- **Concrete fix**
  - For critical operations (import, export, bulk delete), ensure there is in-UI status text and/or `aria-live` region if needed.

### High: ConflictBar and FloatingActionBar lack `aria-live` support for important state changes

- **Files**
  - `components/dashboard/content/ConflictBar.tsx`
  - `components/dashboard/content/FloatingActionBar.tsx`
- **Why it matters**
  - These bars appear/disappear and represent important state (duplicates found, selection count) but there is no announcement for screen readers.
- **Concrete fix**
  - Add a visually-hidden `aria-live="polite"` status region that announces when conflicts appear and when selection mode enters/exits.

- **Status**: Fixed
- **Change**:
  - `components/dashboard/content/ConflictBar.tsx`: added sr-only `aria-live` announcement.
  - `components/dashboard/content/FloatingActionBar.tsx`: added sr-only `aria-live` announcement and explicit `aria-label`s for buttons.

### Medium: Selection actions can trigger many `window.open` calls at once

- **File**: `components/dashboard/content/useSelectionActions.ts`
- **Snippet**
  - `selectedBookmarks.forEach((bookmark) => { window.open(bookmark.url, "_blank", ...); })`
- **Why it matters**
  - Browsers may block multiple popups, and this can create a confusing UX.
- **Concrete fix**
  - Provide a confirmation dialog, open sequentially with user interaction, or generate a single page that lists the selected links.

- **Status**: Fixed
- **Change**: `components/dashboard/content/useSelectionActions.ts` now prompts for confirmation before opening more than 5 tabs.

---

# Additional notable issues (cross-cutting)

## Broken export in dashboard actions

- **File**: `app/dashboard/actions/index.ts`
- **Snippet**
  - `export * from "./tokens";`
- **Observation**
  - `app/dashboard/actions/tokens.ts` does **not exist** in this workspace (tool read failed).
- **Why it matters**
  - This will break imports/build if anything imports `app/dashboard/actions` barrel.
- **Concrete fix**
  - Remove that export or add the missing file (depending on intended functionality).

- **Status**: Fixed
- **Change**: Removed `export * from "./tokens";` from `app/dashboard/actions/index.ts`.
- **Test**: Start the dev server and navigate to `/dashboard`. Also use the UI actions that call server actions (create a group, add a bookmark). Confirm there is no build/runtime error related to `./tokens` imports.

---

- **Test**: Start the dev server, navigate to `/dashboard`, and run your full manual regression checklist (add/edit/delete/select/import/export/keyboard). Confirm there are no runtime errors in the console and all dialogs reset state correctly between runs.
