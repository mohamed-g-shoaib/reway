# Reway: Project Memory

## User Prompt

```txt
Moving on, let's create the homepage of the project, first of all let's know what the project is about.

bookmark manager built for people who save a lot of links and need them to be findable. It replaces browser bookmark folders with a dedicated interface that fetches metadata automatically, organizes resources by category, and works across devices.

What It Does

- Saves bookmarks with automatic metadata extraction (title, description, favicon, OpenGraph image)
- Organizes links into custom categories with icons and colors
- Imports existing bookmarks from browser exports
- Supports dark and light themes
- Syncs across devices with secure authentication

Who It's For

People who regularly save articles, documentation, tools, and resources for later reference. Developers, researchers, designers, students, and anyone who collects links.

Why I'm building This
I've tried everything. Pocket, Raindrop, browser bookmarks, Notion databases, even text files. Nothing stuck. Either they were too feature-heavy (I don't need teams, analytics, or AI summaries), too ugly, or too slow. I just wanted a fast, clean way to save links and actually find them later.

What I Want
Fast - Instant feedback, no loading spinners
Keyboard-first - I hate reaching for the mouse
Clean - No clutter, no notifications, no "engagement"
Smart - Fetch metadata automatically, extract links from screenshots
Mine - No tracking, no social features, just my stuff

What I want to Build
- The Input Bar Paste a URL and hit Enter. That's it. Alam fetches the title, favicon, and preview image in the background.
- If I paste a wall of text with multiple URLs (like research notes or Twitter threads), AI extracts all the links and saves them individually.
- I can even paste screenshots with visible URLs. The AI reads the image and pulls out the links. This is perfect for mobile screenshots or design inspiration.
- For the AI I will use gemini-2.5-flash-lite from vercel ai sdk because this model has a big free tier.
- Search That Actually Works Press Cmd+F  to search. No separate search page, no modal. The input bar just switches to search mode. Results filter as I type, searching through titles, URLs, and descriptions.
- Groups I organize bookmarks into color-coded groupsor named groups. Not nested folders. Just simple, flat categories. It shows counts, lets me create new groups, and I can drag to reorder bookmarks.
- Full Control I can edit everything. Titles, descriptions, URLs, group assignments. Sometimes metadata comes back wrong, or I want to add context. No need to delete and re-add.
- I wanbt Everything to feel instant because I want to use optimistic UI updates. The UI responds immediately, then syncs to the database in the background. If something fails, it rolls back silently.

Design Philosophy
I wanted this to feel like a tool, not an app. Inspired by Raycast, Arc, and the brutalist web movement:
Clean borders, minimal shadows
Hover states that feel responsive
On mobile, the layout stays just as clean. Everything stacks vertically with touch-friendly tap targets and plenty of breathing room.

---

Let's discuss the project after you read the above carefully

```

## Agent

Reway is a high-performance, premium bookmark manager built with **Next.js 16**, **React 19**, and **Supabase**. Our journey focuses on "Visual Excellence" and "Speed," moving away from generic UI patterns towards a tool that feels professional and instantaneous.

### What We've Built So Far

- **Foundation**: Next.js 16 App Router with Supabase Auth and Database. Implemented "Optimistic UI" for zero-latency interactions.
- **Design System**: A custom "Graphite" aesthetic using Vanilla CSS, Glassmorphism, and **Hugeicons**. We completely removed `lucide-react` to ensure a bespoke, premium look.
- **Core Components**:
  - **Command Bar**: A central, keyboard-first interface (Cmd+K style) for searching and saving URLs.
  - **Intelligent Navbar**: Left-side navigation with group persistence, active indicators, and a modern "plus" button for group creation.
  - **Bookmark Board**: A grid of bookmarks with automatic metadata enrichment (fetching titles/favicons in the background).
  - **Group System**: Functional group creation with a sophisticated icon picker powered by a categorized `Hugeicons` list.

### Implementation Details

- **Hugeicons Migration**: Switched to `@hugeicons/core-free-icons` for better tree-shaking and a sharper visual language. Managed through a central map in `lib/hugeicons-list.ts`.
- **Supabase Integration**: Robust RLS policies and server-side client generation. Auto-generated types for full end-to-end safety.
- **Optimistic Workflows**: URL submission instantly creates a "pending" card while a background edge function enriches the data.

### Future Focus

- **AI Extraction**: Using Gemini-2.5-flash-lite to parse links from walls of text or screenshots.
- **Global Search**: High-performance client-side filtering.
- **Data Persistence**: Ensuring DnD reordering remains slick and syncs reliably.

### Tools & Preferences

- **Framework**: Next.js 16 (Turbopack).
- **Styling**: Vanilla CSS + Radix/Base UI (low-level primitives for high-level control).
- **Icons**: Hugeicons exclusively.
- **Workflow**: Task-driven commitment, automated type generation, and descriptive PR titles.
