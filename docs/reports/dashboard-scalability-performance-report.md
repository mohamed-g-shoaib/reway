# Dashboard Scalability & Performance Future Concerns Report

Scope: anticipate bottlenecks for **500+ concurrent users**, each with **50–100 groups** and **500–1000 bookmarks**, based on the performance guidance under:

- `.agent/skills/vercel-react-best-practices/*`
- `.agent/skills/react-performance-best-practices/*`
- `.agent/skills/supabase-postgres-best-practices/*`

This document focuses on **future, high-impact risks** and **what to do when they show up** (symptoms, mitigations, expected gains) at the stated scale.

---

## System model (what “scale” means here)

### Expected hot paths

- **Cold dashboard load** (`/dashboard`): fetch user + initial bookmarks/groups/notes/todos.
- **Steady-state interaction**: searching, selection mode, drag-and-drop reorder, opening preview/edit sheet.
- **Write-heavy bursts**: importing bookmarks (hundreds/thousands) + enrichment.
- **Cross-tab/device updates**: realtime sync (broadcast updates) + optimistic updates.

### Primary resource constraints

- **Postgres query time**: sequential scans, missing indexes, inefficient RLS patterns.
- **Postgres connection pressure**: too many concurrent queries during imports/enrichment.
- **Next.js server action latency**: avoid waterfalls; reduce “fetch then filter in JS”.
- **Client CPU/render time**: avoid re-rendering large lists; avoid expensive per-item work; use `content-visibility`.
- **Network egress**: avoid sending entire datasets repeatedly; avoid unnecessary serialization.

---

## Findings by layer

## 1) Database (Supabase/Postgres)

### 1.1 Missing/incorrect indexes for common filters

**Risk**: CRITICAL. Missing indexes on columns used in `WHERE` (including RLS columns like `user_id`) can cause sequential scans and exponential slowdowns as row counts grow.

**What to verify in Supabase** (highest value checks):

- **`bookmarks(user_id)`** index exists.
- **`bookmarks(user_id, group_id)`** index exists if group filtering is common.
- **`bookmarks(user_id, normalized_url)`** index exists (duplicate checks, de-duping).
- **`groups(user_id)`**, `notes(user_id)`, `todos(user_id)` indexes exist.

If any are missing, add them. (This is directly recommended by Supabase “Add indexes on WHERE columns”.)

### 1.2 Import & enrichment write bursts

**Risk**: MEDIUM-HIGH.

When users import 500–1000 bookmarks, the app can generate:

- many inserts
- many enrichment updates
- many concurrent network requests

**Current state**: generally good.

- Import uses explicit concurrency limits.
- Enrichment is performed with separate concurrency.

**Scaling concern**: if 500 users import concurrently, DB can get hammered.

**Recommendation (only if you observe DB saturation)**:

- Consider moving enrichment to a background worker/queue (Edge Function + queue, or external worker) rather than doing it in the request lifecycle.
- Add server-side throttling per user.

---

## 2) Next.js server actions & data fetching

### 2.1 Waterfalls on dashboard load

**Risk**: CRITICAL if sequential; otherwise fine.

**Recommendation**:

- Keep data fetches independent and parallel.
- If new data sources are added later, avoid adding them sequentially.

### 2.2 Serialization pressure (RSC boundary)

**Risk**: MEDIUM-HIGH.

At 1000 bookmarks, the payload can be large.

**Recommendation (only if you see slow TTFB / large HTML payloads)**:

- Reduce fields returned by `getBookmarks()` to only what the dashboard needs for initial paint.
- Lazy-load heavy fields (screenshots, OG images) on demand.
- Consider streaming with Suspense boundaries if you introduce additional panels.

---

## 3) Client rendering & interaction

### 3.1 Long list rendering cost (500–1000 bookmarks)

**Risk**: HIGH.

Even with good memoization, rendering 1000 React nodes with images can be costly.

**Current mitigations observed**:

- Long-list optimization patterns exist in bookmark components (e.g., `content-visibility: auto` usage in places).

**When to introduce virtualization**:

- If you observe frame drops and slow interactions at 1000 items, add virtualization (e.g., react-virtual) for the `list` view.
- For grid/card views, `content-visibility` + image lazy-loading can often be “good enough” until much higher counts.

### 3.2 Expensive per-item computations

**Risk**: MEDIUM.

Examples:

- `toLocaleDateString` inside `.map` for every bookmark on every render.

**Recommendation**:

- Keep per-item computation minimal.
- Avoid creating regex/formatters inside loops.

### 3.3 Sorting and derived data

**Risk**: MEDIUM.

At 1000 bookmarks, `toSorted()` and repeated `Map` creation can be noticeable if triggered frequently.

**Current state**:

- `BookmarkBoard` uses `useMemo` for ordered/rendered bookmarks.

**Recommendations (only if profiling shows re-sort churn)**:

- Move sorting to the state update path (when bookmarks change) instead of on render.
- Maintain stable “order arrays” per group (ids) to avoid repeated sorting of full objects.

### 3.4 Event listeners and selection mode

**Risk**: LOW-MEDIUM.

Global message listeners exist for extension integration and realtime.

**Recommendation**:

- Ensure listeners are installed once per mount and cleaned up.
- Prefer `useGlobalEvent` (already used) to centralize.

---

## 4) Realtime, multi-tab, and optimistic updates

### 4.1 Realtime broadcast fan-out

**Risk**: MEDIUM.

For each client session, realtime channels receive broadcasts and update local state.

**Potential issue at scale**:

- Too-frequent updates can trigger frequent list re-renders.

**Recommendation (only if it becomes noisy)**:

- Batch updates (queue and flush every 50–100ms) to reduce render frequency.
- Prefer updating only the changed record (already done) and avoid full list rebuilds.

---

## 5) Import/Export

### 5.1 Import parsing CPU & memory

**Risk**: MEDIUM.

Parsing large HTML bookmark exports with DOMParser can be heavy.

**Recommendation (only if needed)**:

- Use a Web Worker for parsing to keep the UI responsive.
- Keep concurrency low enough to avoid saturating the device.

### 5.2 Export string building

**Risk**: LOW-MEDIUM.

Export builds a big HTML string in memory.

**Recommendation (only if needed)**:

- Consider streaming/Chunk building or using `WritableStream` if exports become massive.

---

## Concrete checklist for 500+ concurrent users

- **Database**
  - Confirm indexes exist for `user_id` filters on all major tables.
  - Confirm `bookmarks(user_id, normalized_url)` index exists.
- **Server actions**
  - No sequential awaits in hot paths.
  - No “load everything then filter in JS”.
- **Client**
  - Avoid heavy per-item compute and repeated transforms.
  - Use `content-visibility: auto` for long lists.
  - Add virtualization only when needed.
