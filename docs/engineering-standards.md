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
  - Avoid gradients unless extremely subtle and justified.
- **Responsive & Mobile-First**:
  - Every layout must be mobile-first.
  - Interfaces must be verified on mobile, laptop, and ultra-wide screens.
  - Respect `safe-area-inset` for fixed elements.

### Components & Elements

- **Z-Index**: Use a fixed z-index scale; avoid arbitrary values.
- **Radii**: Ensure nested radii are concentric.
- **Selection**: Disable text selection for interactive drag elements and apply `inert` where necessary.
- **Empty States**: Must provide exactly one clear next action.

---

## 2. Accessibility & Semantics (Fixing Accessibility)

### Priority 1: Critical (Names & Keyboard)

- **Accessible Names**: Every interactive control MUST have an accessible name. Icon-only buttons MUST have `aria-label`.
- **Keyboard Operability**:
  - All interactive elements must be reachable by `Tab`.
  - Never use `div` or `span` as buttons without full keyboard/ARIA support.
  - Focus MUST be visible (prefer `:focus-visible`).
  - `Escape` must close dialogs or overlays.
- **Focus Management**:
  - Dialogs/Modals must trap focus while open.
  - Restore focus to the trigger on close.
  - Set initial focus inside dialogs.

### Priority 2: High (Semantics & Forms)

- **Native over ARIA**: Prefer native elements (`<button>`, `<a>`, `<input>`) over role-based hacks.
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
  - Shareable pages must set OG title, description, and absolute image URL.
  - Set `twitter:card` to `summary_large_image` by default.

### Technical Metadata

- **Icons**: Include a standard favicon and `apple-touch-icon`.
- **Theme**: Set `<meta name="theme-color">` intentionally to match branding.
- **Localization**: Set the HTML `lang` attribute correctly.

---

## 4. Interactions & Forms

### Interaction Design

- **Hit Targets**: Minimum 44px on mobile, 24px on desktop.
- **No Blocked UI**: NEVER block paste in inputs or textareas.
- **Feedback**:
  - Use optimistic updates for a fast feel, but allow for Undo/Rollback.
  - Loading states for buttons: show a spinner/indicator but KEEP the label.
  - Add a slight delay (~150ms) to skeletons to prevent flickering on fast loads.

### Form Behavior

- **Submission**: `Enter` should submit forms; `Cmd/Ctrl + Enter` for textareas.
- **Validation**: Validate _after_ typing, not while blocking the user.
- **Sticky State**: Components should not lose focus or values during hydration or re-renders.
- **Autofocus**: Use sparingly, and only on desktop.

---

## 5. Animation & Transitions (Baseline UI)

### Rules & Performance

- **Compositor Only**: Animate ONLY `transform` and `opacity`. NEVER animate layout props (`width`, `height`, `margin`).
- **Interaction Feedback**: Animations for interaction feedback must not exceed `200ms`.
- **Entrance**: Use `ease-out` for entrance animations.
- **Off-screen**: Pause looping animations when they are not in the viewport.
- **Reduced Motion**: Respect `prefers-reduced-motion` settings.

### Technology Stack

- **Library**: Use `motion/react` (Framer Motion) for JS-based animations.
- **CSS**: Prefer Tailwind CSS transitions or `tw-animate-css` for simple entrance animations.

---

## 6. Performance Baseline

- **Above the Fold**: Preload critical images; lazy-load everything else.
- **Cumulative Layout Shift (CLS)**: Always set explicit dimensions on images.
- **React Optimization**:
  - Avoid `useEffect` for logic that can be handled during render.
  - Minimize re-renders; use uncontrolled inputs where possible.
- **Transitions**: NEVER use `transition: all`. Be specific.

---

## 7. Content & Copywriting

- **Voice**: Active voice, second person ("Your bookmarks"), professional but clear.
- **Formatting**:
  - Use Title Case for headings and buttons.
  - Use typographic quotes (“ ”) and ellipsis characters (…).
  - Use tabular numbers (`tabular-nums`) for data comparisons or counts.
- **Ambiguity**: Error messages must guide the user on how to fix the issue.

---

_This document is a living reference. When in doubt, prioritize Accessibility and Performance over Visual Style._
