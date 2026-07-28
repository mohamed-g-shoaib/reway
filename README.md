![Reway bookmark manager](public/cover.webp)

# Reway

Reway is a personal bookmark operating system for people who save heavily and need to find things later. It combines a private web library with a Chrome extension, so a page, a collected batch of links, or a full tab session can become a usable reference instead of another forgotten browser bookmark.

The product is built around one rule: capture first, organise immediately, enrich asynchronously. Saving should feel instant; titles, descriptions, favicons, images, duplicate handling, and live updates can improve the result after the bookmark exists.

## At a glance

|              |                                                                                      |
| ------------ | ------------------------------------------------------------------------------------ |
| **Product**  | Cross-device bookmark library and browser capture tool                               |
| **For**      | Researchers, designers, developers, and people who work across many tabs             |
| **Surfaces** | Next.js web dashboard and Chrome Manifest V3 extension                               |
| **Core job** | Capture references quickly, then make them easy to recognise and retrieve            |
| **Status**   | Active product development; no launch, adoption, or revenue metrics are claimed here |

## The problem

Browser bookmarks are good at storing links but poor at helping someone return to them. A growing collection becomes difficult to scan, organise, or trust—especially when the useful context lived in a tab session, a handful of links on a page, or visual metadata that was never saved.

Reway treats a bookmark as part of an active working library. The browser is the capture point; the dashboard is where saved material becomes searchable, grouped, and reusable.

## What was built

### A private, retrieval-first library

- Authenticated, user-scoped bookmarks, groups, notes, and todos.
- Search, command workflows, group management, and visit-aware ranking.
- List, card, icon, and folder-board views for different ways of scanning a collection.
- Visual context through favicons, Open Graph images, titles, descriptions, and group colour.
- Cookie-backed dashboard preferences with validated fallbacks.

### Browser-native capture

- **Save Page** for the current tab.
- **Save Links** for gathered link batches.
- **Tab Session** for turning the current window into a saved group.
- A quick-access floating surface for searching saved material and opening bookmark groups while browsing.
- Dashboard-to-extension group-opening, cached extension reads, and optional X/Twitter bookmark capture.

### A deliberate save pipeline

```text
Web dashboard or Chrome extension
              ↓
     authenticated bookmark capture
              ↓
     private Supabase-backed library
              ↓
metadata enrichment and realtime updates
```

The visible save is kept separate from enrichment. URLs are normalised before persistence, data mutations remain user-scoped, and metadata fetching is treated as a follow-up phase rather than a reason to delay capture.

## Product decisions

### Capture should not interrupt research

Reway saves the bookmark before attempting richer metadata work. That keeps the core action responsive even if a source page is slow or unavailable.

### Retrieval needs more than folders

The library combines text search, visual metadata, flexible views, groups, notes, todos, and usage signals. The aim is to make a previously saved reference recognisable again—not merely to file its URL away.

### The extension and dashboard have distinct jobs

The extension owns browser-context capture and quick access. The dashboard owns the long-term library. Shared server routes keep the two surfaces connected without duplicating the persistence rules.

## Technology

| Area                  | Technology                                      |
| --------------------- | ----------------------------------------------- |
| **Application**       | Next.js 16, React 19, TypeScript                |
| **UI**                | Tailwind CSS 4, shadcn/ui, Hugeicons, Motion    |
| **Data and auth**     | Supabase, PostgreSQL, Supabase Auth             |
| **Browser extension** | Chrome Manifest V3, vanilla JavaScript, esbuild |
| **Interaction**       | dnd-kit, React Hook Form, Zod                   |
| **Tooling**           | pnpm, oxlint, oxfmt                             |

## Run locally

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local`, then supply your site URL and Supabase credentials.

3. Apply the SQL migrations in `supabase/migrations/` through the Supabase CLI or your normal database workflow.

4. Start the web application:

   ```bash
   pnpm dev
   ```

5. Build the extension's quick-access bundle, then load the `extension/` directory as an unpacked extension in Chrome:

   ```bash
   pnpm build:ext
   ```

See [the extension guide](extension/README.md) for manual Chrome installation details.

## Project map

- `app/` — routes, server actions, and extension API endpoints.
- `components/` — marketing, dashboard, authentication, and shared UI.
- `extension/` — Chrome extension source, assets, and browser-specific flows.
- `lib/` — shared capture, reading, ranking, metadata, and data-access utilities.
- `hooks/` — dashboard behaviour and UI state.
- `supabase/migrations/` — database changes.
- `spec/` — product constraints, architecture decisions, and session history.

## Further context

- [Project constraints and product model](spec/index.md)
- [Browser extension guide](extension/README.md)

## Credits

Designed and developed by [Devloop](https://www.devloop.software/).
