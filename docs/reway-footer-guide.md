# Implementing the "Reway" Footer Wordmark

This guide explains how to add a large, responsive branding wordmark to a footer, modeled after the "Mind Cave" implementation.

## 1. Create the SVG Component

Create a file at `components/reway-word.tsx`. This component uses an SVG with a `<text>` element to ensure it scales perfectly without losing quality or becoming "heavy" like an image.

```tsx
import * as React from "react";
import { SVGProps } from "react";

const RewayWord = (props: SVGProps<SVGSVGElement>) => (
  // The viewBox is tuned to fit the text precisely
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 70.366" {...props}>
    <text
      xmlSpace="preserve"
      x={256}
      y={291.442}
      style={{
        fontStyle: "normal",
        fontWeight: 700,
        fontSize: "94px",
        fontFamily: "var(--font-space-mono), monospace", // Use the project's mono font
        textAnchor: "middle",
        fill: "currentColor", // Inherits color from parent
      }}
      transform="matrix(1.005 0 0 .995 0 -220.8)" // Vertical adjustment to center in viewBox
    >
      <tspan x={256} y={291.442}>
        {"REWAY"}
      </tspan>
    </text>
  </svg>
);

export default RewayWord;
```

## 2. Position it in the Footer

Add the component to the bottom of your footer (e.g., in `components/footer.tsx`). Place it **inside** the main container but **after** the grid content.

### Styling Strategy

- **Responsiveness:** Use `w-full h-auto` on the SVG so it stretches to fill the container on all screen sizes.
- **Aesthetics:** Use a very low opacity (e.g., `text-muted-foreground/15`) so it feels like a subtle, premium watermark.
- **Spacing:** Use a large top margin (`mt-16` or `mt-24`) to separate it from the footer links.

```tsx
import RewayWord from "@/components/reway-word";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-16">
        {/* ... Existing Footer Grid Links ... */}

        {/* The Large Branding Wordmark */}
        <div className="mt-16 w-full text-muted-foreground/15">
          <RewayWord className="h-auto w-full" />
        </div>
      </div>
    </footer>
  );
}
```

## 3. Why this works:

1.  **Perfect Scaling:** Being an SVG `<text>` element, it remains sharp at any size.
2.  **Theming:** By using `fill="currentColor"`, it automatically adapts to Dark/Light mode based on the CSS class applied to the container.
3.  **Performance:** It's pure code—no heavy PNG/WebP assets to load.
