# Reway Engineering Standards: UI, UX, and Metadata

This document serves as the central source of truth for all UI, UX, and metadata standards for the Reway project. It synthesizes principles from the internal skill sets to ensure every addition to the codebase is professional, accessible, and performant.

---

## 1. UI & Visual Design (Modern UI Quality Gate)

### Core Principles

- **Whitespace > Decoration**: Prioritize layout, spacing, and typography over borders, gradients, or effects.
- **Visual Hierarchy**: Create hierarchy through spacing and font weight, not heavy effects.
- **Minimalist Aesthetic**:
  - Avoid neon, glow, glassmorphism, or novelty effects.
  - Avoid heavy shadows—use soft, layered shadows (ambient + direct).
  - Avoid gradients unless extremely subtle and justified. **NEVER** use purple or multicolor gradients.
- **Responsive & Mobile-First**:
  - Every layout must be mobile-first.
  - **NEVER** use `h-screen`; always use `h-dvh`.
  - Respect `safe-area-inset` for fixed elements.
  - Set `touch-action: manipulation` and `webkit-tap-highlight-color`.

### Components & Elements

- **Z-Index**: Use a fixed z-index scale; avoid arbitrary `z-*` values.
- **Radii**: Ensure nested radii are concentric.
- **Squares**: Use `size-*` utility for square elements instead of separate `w-*` and `h-*`.
- **Selection**: Disable text selection for interactive drag elements and apply `inert` where necessary.
- **Windows Support**: Set background and color on native `<select>` elements explicitly (essential for Windows).

---

## 2. Accessibility & Semantics (Fixing Accessibility)

### Priority 1: Critical (Names & Keyboard)

- **Accessible Names**: Every interactive control MUST have an accessible name. Icon-only buttons MUST have `aria-label`.
- **Keyboard Operability**:
  - All interactive elements must be reachable by `Tab`.
  - **NEVER** use `tabindex` greater than 0.
  - Focus MUST be visible (prefer `:focus-visible`).
  - `Escape` must close dialogs or overlays.
- **Focus Management**:
  - Dialogs/Modals must trap focus while open.
  - Restore focus to the trigger on close.
  - Set initial focus inside dialogs.

### Priority 2: High (Semantics & Forms)

- **Native over ARIA**: Prefer native elements (`<button>`, `<a>`, `<input>`) over role-based hacks.
- **Lists**: Lists MUST use `ul` or `ol` with `li` items.
- **Heading Hierarchy**: Do not skip heading levels (H1 -> H2 -> H3).
- **ARIA Best Practices**: Use `aria-describedby` for errors and `aria-live` for critical announcements.

---

## 3. Metadata & SEO (Fixing Metadata)

### Correctness

- **Single Source**: Define metadata in one place per page (e.g., Next.js Metadata API). Avoid duplicate tags.
- **Sanitization**: Escape and sanitize dynamic or user-generated strings in metadata.
- **Deterministic**: Metadata values must be stable and predictable.

### SEO Essentials

- **Title & Description**:
  - Every page must have a unique, accurate `<title>`.
  - Shareable pages MUST have a plain text meta description.
- **Canonical & Indexing**:
  - Canonical URLs must point to the preferred, absolute URL.
  - Use `noindex` for private, duplicate, or staging pages.
- **Social Cards (OG/Twitter)**:
  - shareable pages must set OG title, description, and absolute image URL.
  - `og:url` MUST match the canonical URL.
  - Set `twitter:card` to `summary_large_image` by default.

---

## 4. Interactions & Forms

### Interaction Design

- **Hit Targets**: Minimum 44px on mobile, 24px on desktop. Expand targets for visual elements <24px.
- **Mobile Inputs**: Font size MUST be ≥16px on mobile to prevent automatic browser zoom.
- **No Blocked UI**: **NEVER** block paste in inputs or textareas.
- **Feedback**:
  - Use optimistic updates with rollback/Undo.
  - Loading states for buttons: show indicator but KEEP the label.
  - **Skeletons**: Add ~150–300ms delay to prevent flickering, and ensure ~300–500ms _minimum_ visible time.
  - Set `overscroll-behavior: contain` intentionally on scrolling overlays.

### Form Behavior

- **Submission**: `Enter` should submit forms; `Cmd/Ctrl + Enter` for textareas.
- **Validation**: Validate _after_ typing, not while blocking the user.
- **Sanitization**: Always trim whitespace from text inputs.
- **Sticky State**: Components should not lose focus or values during hydration.

---

## 5. Animation & Transitions (Baseline UI)

### Rules & Performance

- **Compositor Only**: Animate ONLY `transform` and `opacity`. **NEVER** animate layout props (`width`, `height`, `top`, `left`, `margin`).
- **Interaction Feedback**: Interaction feedback animations MUST NOT exceed `200ms`.
- **Durations**: NEVER exceed `200ms` for interaction feedback.
- **Restrictions**:
  - **NEVER** use `transition: all`.
  - **NEVER** animate large `blur()` or `backdrop-filter` surfaces.
  - **NEVER** apply `will-change` outside an active animation.
- **Lifecycle**: Pause looping animations when off-screen.
- **Reduced Motion**: Respect `prefers-reduced-motion` and avoid essential motion for these users.

### Technology Stack

- **Library**: Use `motion/react` (formerly Framer Motion) for JS-based animations.
- **CSS**: Prefer Tailwind CSS transitions or `tw-animate-css` for simple entrance animations.
- **Logic**: Use the `cn` utility (`clsx` + `tailwind-merge`) for all conditional class logic.

---

## 6. Performance & Implementation

- **Above the Fold**: Preload critical images; lazy-load everything else.
- **Image CLS**: Always set explicit dimensions on images.
- **React Logic**: **NEVER** use `useEffect` for anything that can be expressed as render logic.
- **Networking**: Aim for <500ms network budget for mutations.

---

## 7. Content & Copywriting

- **Voice**: Active voice, second person ("Your bookmarks"), professional but clear.
- **Typography Formatting**:
  - Use `text-balance` for headings and `text-pretty` for body paragraphs.
  - Use `tabular-nums` for data comparisons, prices, or counts.
  - Use Title Case for headings and buttons.
  - Use typographic quotes (“ ”) and ellipsis characters (…).
  - Space between numbers and units (`10&nbsp;kg`).
- **Clarity**: Error messages MUST guide the user toward a fix. Placeholders should provide an example and end with an ellipsis.

---

_This document is a living reference. When in doubt, prioritize Accessibility and Performance over Visual Style._
