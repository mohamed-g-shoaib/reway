# Reway: Development Plan

## Project Overview

Reway is a high-performance, tool-like bookmarking application built with Next.js 16, Supabase, and a specialized Graphite design system.

---

## Current Status: Phase 1 (Foundation) - ✅ COMPLETE

- [x] Initial Project Setup (Next.js 16, shadcn/ui, oklch colors)
- [x] Theme Management (next-themes + custom Graphite ModeToggle)
- [x] Auth Infrastructure (Next.js 16 `proxy.ts`, Google OAuth, Callback Fixes)
- [x] Database Schema (Profiles, Groups, Bookmarks tables + RLS)
- [x] Multi-tenancy & Type Safety (Postgres triggers + Generated TS types)

---

## Phase 2: Core Functionality - 🚀 IN PROGRESS

### 1. Data Integration

- [x] Connect `BookmarkBoard` to live Supabase data (replace mock data)
- [x] Implement "Empty State" for new users
- [ ] Add loading skeletons for data fetching

### 2. Creation Flow

- [x] Implement "Add Bookmark" functionality
- [x] Build metadata scraper API (fetch title/favicon/domain from URL)
- [x] Implement Optimistic UI & Background Enrichment for zero-latency saves
- [x] Build Smart Favicon Fallback (Google API + Initial Letters)
- [x] Connect `CommandBar` to bookmark creation

### 3. Organization & Management

- [x] Implement Group creation and filtering (Hugeicons Picker + Filtering)
- [x] Enable bookmark reordering/sorting (DnD persistence in DB)
- [x] Add bookmark deletion and editing
- [x] Complete Migration to Hugeicons (Lucide removed)
- [x] Implement **AI Link Extraction** (Gemini 2.5 Flash-Lite)
- [x] Add **Clipboard Paste Support** (Images + Text)
- [x] Implement **Batch Optimistic UI** & Parallel Processing
- [x] Add **Premium Shimmer Effects** for loading states
- [x] Implement **OS-Aware Keyboard Shortcuts** & Cheat Sheet Header
- [x] Implement **Two-Click Delete Pattern** with Animated Transitions
- [ ] Implement **Inline Bookmark Editor** (Row expansion)
- [ ] Implement **Inline Group Creation & Editing** (With Popover Icon Picker)

---

## Phase 3: Extensions & Advanced Features

- [ ] **Chrome Extension**: Basic "Save to Reway" functionality
- [ ] **Search Engine**: High-performance client-side search across all bookmarks
- [ ] **Web Clipper**: Capture snippets and snapshots
- [ ] **Batch Actions**: Multi-select and bulk move/delete

---

## Phase 4: Polish & Scale

- [ ] Landing page refinement and copy
- [ ] Performance audit (LCP, Hydration, DB Query optimization)
- [ ] Analytics and monitoring setup
- [ ] Public Beta release

---

## Development Principles

- **Speed First**: Every interaction must feel instantaneous.
- **Privacy by Design**: Strict RLS; user data is private by default.
- **Visual Excellence**: Maintain the premium Graphite aesthetic.
- **Keyboard-First**: Navigation should be possible without a mouse wherever intuitive.
