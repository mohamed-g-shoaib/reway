export const features = [
  {
    title: "Smart Link Extraction",
    description:
      "Paste raw notes or code directly into Reway. Our engine extracts every URL instantly, letting you batch-save research without the manual chore.",
    demo: "extract",
  },
  {
    title: "Groups That Stay Organized",
    description:
      "Organize your library into dedicated groups for research, inspiration, and active builds with real-time counts and visual separators.",
    demo: "groups",
  },
  {
    title: "Import & Export",
    description:
      "Export any group as a clean HTML file. We support importing from standard browser bookmarks to centralize your existing knowledge.",
    demo: "import-export",
  },
  {
    title: "Flexible View Modes",
    description:
      "Switch between high-density lists, visual cards, and icon-only layouts. Every view is optimized for rapid scanning and clarity.",
    demo: "views",
  },
] as const;

export const demoLinks = [
  {
    title: "Linear",
    domain: "linear.app",
    url: "https://linear.app",
    group: "Research",
    favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
  },
  {
    title: "Vercel",
    domain: "vercel.com",
    url: "https://vercel.com",
    group: "Inspiration",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
  },
  {
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com",
    group: "Build",
    favicon: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64",
  },
] as const;

export const demoVideos = [
  {
    title: "Full Page Capture",
    description:
      "Organize entire pages into your library. Keep the context of where your links came from without the noise.",
    src: "/assets/videos/save-page.mp4",
    accentColor: "bg-highlight-page",
    highlights: [
      "Distraction-free reading view",
      "Preserves original source URL",
      "Smart categorization of content",
    ],
    blurDataURL: undefined,
  },
  {
    title: "Save Links Anywhere",
    description:
      "Instantly capture links from any website, note, or app with a single click. Reway extracts the core context for you.",
    src: "/assets/videos/save-links.mp4",
    accentColor: "bg-highlight-links",
    highlights: [
      "Auto-extract titles and metadata",
      "One-click browser extension",
      "Seamless clipboard detection",
    ],
    blurDataURL: undefined,
  },
  {
    title: "Manage Tab Sessions",
    description:
      "Save your current window session. Restore all tabs in one click or archive them for later.",
    src: "/assets/videos/tab-sessions.mp4",
    accentColor: "bg-highlight-sessions",
    highlights: [
      "Bulk save multiple tabs",
      "Restore sessions in one click",
      "Memory-efficient tab sleeping",
    ],
    blurDataURL: undefined,
  },
  {
    title: "X (Twitter) Integration",
    description:
      "One-click capture from X.com. Reway extracts the tweet content and thread context automatically.",
    src: "/assets/videos/x-bookmarks.mp4",
    accentColor: "bg-highlight-x",
    highlights: [
      "Automatic thread detection",
      "Beautifully formatted tweets",
      "Deep search within saved X links",
    ],
    blurDataURL: undefined,
  },
] as const;
