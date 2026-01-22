# React & Next.js Performance Standards

This document establishes the mandatory performance standards for Reway, derived from the Project React Performance Skill and Vercel Engineering best practices.

## 1. Eliminating Waterfalls (Impact: CRITICAL)

Waterfalls are the #1 performance killer. Every sequential `await` adds full network latency.

- **Parallel Fetching**: Always use `Promise.all()` for independent fetches.
- **Dependency-Based Parallelism**: For complex chains, start promises at the earliest possible moment.
- **Strategic Suspense Boundaries**: Defer non-critical UI to allow the shell to render immediately.
- **Defer Await Until Needed**: Move `await` into conditional branches to avoid blocking logic that doesn't need the data.
- **Server Action Parallelism**: Start independent promises (e.g., `auth()`, `db.config()`) before awaiting the first one.

## 2. Bundle Size Optimization (Impact: CRITICAL)

Reducing initial bundle size directly improves TTI (Time to Interactive) and LCP (Largest Contentful Paint).

- **Avoid Barrel Files**: Never import from index files re-exporting thousands of modules (e.g., `lucide-react`, `shadcn/ui` entry points). Use direct imports:
  ```typescript
  // CORRECT: Direct import
  import CheckIcon from "lucide-react/dist/esm/icons/check";
  ```
- **Conditional Module Loading**: Use `next/dynamic` for heavy components (modals, editors) or modules that only run on the client (`typeof window !== 'undefined'`).
- **Defer Third-Party Scripts**: Load analytics and trackers using `next/script` with `afterInteractive` or `lazyOnload`.
- **Preload on Intent**: Preload heavy bundles on hover or focus to reduce perceived latency.

## 3. Server-Side Performance (Impact: HIGH)

Optimizing RSC (React Server Components) and server-side responses.

- **Minimize Serialization**: Only pass primitive fields across the Client/Server boundary. Do not pass entire database objects.
- **Request Deduplication**: Use `React.cache()` for shared data fetching (like `getCurrentUser`) within a single request.
- **Cross-Request Caching**: Use an LRU cache (or Redis) for data shared across multiple sequential user requests.
- **Component Composition**: Structure RSCs so child components fetch their own data rather than awaiting everything in the parent, enabling parallel execution in the RSC tree.

## 4. Client-Side Data Fetching (Impact: MEDIUM-HIGH)

- **Deduplicated SWR**: Use SWR or TanStack Query for client-side fetches.
- **Global Listener Deduplication**: Always use a shared subscription/listener pattern (e.g., `useSWRSubscription`) to avoid registering multiple `window` listeners for the same event key.

## 5. Re-render Optimization (Impact: MEDIUM)

- **Lazy State Initialization**: Use `useState(() => heavyValue)` for expensive initial computations.
- **Defer State Reads**: Do not subscribe to dynamic state (e.g., URLs, storage) if the value is only needed inside a callback (read it _within_ the callback instead).
- **Extract to Memoized Components**: Use `React.memo` for components with stable props that live inside frequently re-rendering parents.
- **Stable Event Handlers**: Use `useLatest` or Ref-based patterns for event handlers in effects to avoid re-subscribing listeners.

## 6. Rendering & JavaScript (Impact: LOW-MEDIUM)

- **content-visibility**: Apply `content-visibility: auto` to off-screen list items.
- **SVG Optimization**: Animate SVG _wrappers_ (divs) rather than internal SVG paths to avoid expensive re-paints.
- **Explicit Conditionals**: Always use `condition ? <Comp /> : null` instead of `condition && <Comp />` to avoid leaking `0`/`false` and potentially optimize short-circuiting.
- **Index Maps**: Convert arrays to `Map`/`Set` for repeated O(1) lookups.
- **Immutable Methods**: Prefer `.toSorted()`, `.toReversed()` over mutating methods.

---

## Technical Audit Checklist

Run this audit before any production-grade commit:

1. [ ] **Waterfalls**: Are any independent `await` calls sequential?
2. [ ] **Imports**: Are we importing from a barrel file (`index.ts`)?
3. [ ] **Serialization**: Is the RSC payload size minimized?
4. [ ] **Initialization**: Is `useState` using a function for expensive initial values?
5. [ ] **Conditionals**: Are we using explicit ternary operators for component visibility?
6. [ ] **Listeners**: Are shared `window` events being registered multiple times?
7. [ ] **Lookups**: Are repeated lookups in large arrays optimized via `Map`?
