## Scope + flow map (non-dashboard surfaces)

### **Routes (app router)**

- **Homepage**: [app/page.tsx](cci:7://file:///d:/Developer/reway/app/page.tsx:0:0-0:0)
  - Server component
  - Calls `createClient()` → `supabase.auth.getUser()` to decide:
    - `dashboardHref = "/dashboard"` if authed, else `"/login"`
    - `ctaLabel = "Dashboard"` or `"Get Started"`
  - Renders [components/landing/LandingPage.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingPage.tsx:0:0-0:0)

- **Login**: [app/login/page.tsx](cci:7://file:///d:/Developer/reway/app/login/page.tsx:0:0-0:0) (client)
  - `motion/react` entrance animation
  - `<form action={signInWithGoogle}>` uses server action [app/login/actions.ts](cci:7://file:///d:/Developer/reway/app/login/actions.ts:0:0-0:0) → OAuth redirect to `/auth/callback`

- **Auth callback**: [app/auth/callback/route.ts](cci:7://file:///d:/Developer/reway/app/auth/callback/route.ts:0:0-0:0)
  - Exchanges OAuth code → sets cookies → redirects to `next` (default [/dashboard](cci:9://file:///d:/Developer/reway/app/dashboard:0:0-0:0)), else [/login](cci:9://file:///d:/Developer/reway/app/login:0:0-0:0)

- **System pages**
  - **Error boundary**: [app/error.tsx](cci:7://file:///d:/Developer/reway/app/error.tsx:0:0-0:0) (client)
  - **Not found**: [app/not-found.tsx](cci:7://file:///d:/Developer/reway/app/not-found.tsx:0:0-0:0) (client)

- **Legal**
  - **Terms**: [app/terms/page.tsx](cci:7://file:///d:/Developer/reway/app/terms/page.tsx:0:0-0:0) (server)
  - **Privacy**: [app/privacy/page.tsx](cci:7://file:///d:/Developer/reway/app/privacy/page.tsx:0:0-0:0) (server)
  - Both reuse landing chrome: [LandingNav](cci:1://file:///d:/Developer/reway/components/landing/LandingNav.tsx:14:0-85:1) + [LandingFooter](cci:1://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:14:0-178:1), and use `getUser()` to set CTA destination/label.

### **Landing composition**

[components/landing/LandingPage.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingPage.tsx:0:0-0:0) composes:

- [LandingNav](cci:1://file:///d:/Developer/reway/components/landing/LandingNav.tsx:14:0-85:1)
- `HeroSection`
- `FeaturesSection`
- [DemoVideosSection](cci:1://file:///d:/Developer/reway/components/landing/DemoVideosSection.tsx:7:0-99:1)
- `CallToAction`
- [LandingFooter](cci:1://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:14:0-178:1)

This means: **any UI/motion violation in LandingNav/Footer affects homepage + legal pages**, and any in motion sections affects homepage.

---

# Initial findings (violations + where they come from)

## A) Baseline UI typography: prohibited tracking usage (same rule as dashboard)

You previously enforced “avoid `tracking-*` unless requested.” The landing previously used tracking in multiple places (footer headings, section labels, and some headings).

**Why it matters**

- It’s the same baseline typography constraint you enforced on dashboard. If we keep the rule consistent, these should be removed or explicitly exempted for marketing pages.

**Recommended fix**

- Replace letter-spacing with hierarchy via:
  - `text-[10px] font-semibold uppercase text-muted-foreground/60` (no tracking)
  - weight/size/opacity instead of tracking.

**Status**: Fixed

- Removed `tracking-*` from marketing/auth/legal/system surfaces:
  - [components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)
  - [components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)
  - [components/landing/FeaturesSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/FeaturesSection.tsx:0:0-0:0)
  - [components/landing/DemoVideosSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/DemoVideosSection.tsx:0:0-0:0)
  - [components/landing/CallToAction.tsx](cci:7://file:///d:/Developer/reway/components/landing/CallToAction.tsx:0:0-0:0)
  - [app/login/page.tsx](cci:7://file:///d:/Developer/reway/app/login/page.tsx:0:0-0:0)
  - [app/error.tsx](cci:7://file:///d:/Developer/reway/app/error.tsx:0:0-0:0)
  - [app/not-found.tsx](cci:7://file:///d:/Developer/reway/app/not-found.tsx:0:0-0:0)
  - [app/privacy/page.tsx](cci:7://file:///d:/Developer/reway/app/privacy/page.tsx:0:0-0:0)
  - [app/terms/page.tsx](cci:7://file:///d:/Developer/reway/app/terms/page.tsx:0:0-0:0)

---

## B) Motion/perf: heavy blur on sticky header (paint-heavy)

- **[components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)**
  - Previously used `backdrop-blur-xl` on a `sticky` header (scroll-adjacent and frequently repainted).

**Why it matters**

- Same as dashboard: `backdrop-filter` on always-visible / scroll-adjacent surfaces is one of the highest paint-cost patterns.

**Recommended fix**

- Prefer non-blurred translucency:
  - `bg-background/95 ring-foreground/8`
- Or gate behind `supports-[backdrop-filter]` with a non-blur fallback.

**Status**: Fixed

- Removed `backdrop-blur-xl` from the sticky header and kept a non-blur translucent background:
  - [components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)

---

## C) Motion/perf: `transition-all` on interactive element (forbidden)

- **[components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)**
  - Social icon wrapper previously used `transition-all`.

**Why it matters**

- Same modern UI gate rule: no `transition-all`.

**Recommended fix**

- Replace with explicit transitions:
  - `transition-colors` (and possibly `transition-transform` if scaling)

**Status**: Fixed

- Replaced `transition-all` with explicit transitions:
  - [components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)

---

## D) Reduced motion: Motion components lack `useReducedMotion` guards

These pages use `motion/react`:

- [app/login/page.tsx](cci:7://file:///d:/Developer/reway/app/login/page.tsx:0:0-0:0) (entrance animation)
- [app/error.tsx](cci:7://file:///d:/Developer/reway/app/error.tsx:0:0-0:0) (entrance animation)
- [app/not-found.tsx](cci:7://file:///d:/Developer/reway/app/not-found.tsx:0:0-0:0) (entrance animation)
- [components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0) (header entrance)
- [components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0) (whileInView + signature animation)
- [components/landing/DemoVideosSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/DemoVideosSection.tsx:0:0-0:0) (whileInView)

**Issue**

- None of these currently guard for reduced-motion.
- On dashboard, we used `motion-reduce:animate-none` for CSS animations; for `motion/react`, the equivalent is typically `useReducedMotion()` and setting transitions to instant / disabling animation.

**Recommended fix pattern**

- In each motion component:
  - `const shouldReduceMotion = useReducedMotion();`
  - If reduced:
    - avoid initial “y” transforms
    - use `initial={false}` or `transition={{ duration: 0 }}`

**Status**: Fixed

- Added reduced-motion guards for `motion/react` entrances and key interactions:
  - [app/login/page.tsx](cci:7://file:///d:/Developer/reway/app/login/page.tsx:0:0-0:0)
  - [app/error.tsx](cci:7://file:///d:/Developer/reway/app/error.tsx:0:0-0:0)
  - [app/not-found.tsx](cci:7://file:///d:/Developer/reway/app/not-found.tsx:0:0-0:0)
  - [components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)
  - [components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)
  - [components/landing/FeaturesSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/FeaturesSection.tsx:0:0-0:0)
  - [components/landing/DemoVideosSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/DemoVideosSection.tsx:0:0-0:0)
  - [components/landing/CallToAction.tsx](cci:7://file:///d:/Developer/reway/components/landing/CallToAction.tsx:0:0-0:0)
  - [components/landing/HeroSection.tsx](cci:7://file:///d:/Developer/reway/components/landing/HeroSection.tsx:0:0-0:0)

---

## E) Duration: one landing animation is very long (0.8s)

- **[components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)**
  - `signatureVariants.transition.duration = 0.8`

**Why it matters**

- Practical animation tips: keep most UI animation <300ms. For a decorative footer signature, 0.8s can feel sluggish and is unnecessary motion.

**Recommended fix**

- Reduce to ~`0.25–0.35s` (and reduced-motion guard).

**Status**: Fixed

- Reduced the footer signature animation duration from `0.8` to `0.32` and gated motion behind reduced-motion:
  - [components/landing/LandingFooter.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingFooter.tsx:0:0-0:0)

---

## F) Scroll-driven state: acceptable but needs caution

- **[components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)**
  - Uses `scroll` listener to toggle `hasScrolled` (with `{ passive: true }`, good)
- This is likely fine, but it _does_ cause re-renders on scroll.
  - It only toggles after passing a threshold, so it’s not “every pixel” (good).

**Optional improvement**

- Ensure it only sets state when the boolean actually changes (it currently sets each scroll event, even if same value). That’s a small perf cleanup.

**Status**: Fixed

- Updated scroll handling to avoid redundant state updates while scrolling:
  - [components/landing/LandingNav.tsx](cci:7://file:///d:/Developer/reway/components/landing/LandingNav.tsx:0:0-0:0)

---

# System + legal pages quick check

- **Legal pages ([app/privacy/page.tsx](cci:7://file:///d:/Developer/reway/app/privacy/page.tsx:0:0-0:0), [app/terms/page.tsx](cci:7://file:///d:/Developer/reway/app/terms/page.tsx:0:0-0:0))**
  - Mainly typography/layout; no obvious motion.
  - They reuse LandingNav/Footer, so fixes there apply to legal pages as well.
- **Error/NotFound**
  - Motion entrance animations are present and now respect reduced motion.

---

# Final status

**Status**: Complete

- Verified via grep that non-dashboard surfaces contain **no**:
  - `tracking-*`
  - `transition-all`
  - `backdrop-blur-xl`
- Verified that all `motion/react` entrances in:
  - login (`/login`)
  - error (`/error`)
  - not-found (`/not-found`)
  - landing sections
    now respect `prefers-reduced-motion`.
