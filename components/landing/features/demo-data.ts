export const features = [
  {
    title: "AI Link Extraction",
    description:
      "Drop in messy notes or screenshots. Reway pulls every link, title, and preview without extra steps.",
    demo: "extract",
  },
  {
    title: "Groups That Stay Organized",
    description:
      "Keep research, inspiration, and builds separated with labeled groups and smart counts.",
    demo: "groups",
  },
  {
    title: "Keyboard Navigation",
    description:
      "Move through bookmarks with arrow keys, preview instantly, and act without touching the mouse.",
    demo: "navigate",
  },
  {
    title: "Flexible View Modes",
    description:
      "Switch between cards and list layouts, depending on how much context you need right now.",
    demo: "views",
  },
] as const;

export const demoLinks = [
  {
    title: "Linear",
    domain: "linear.app",
    url: "https://linear.app",
    date: "Sep 12",
    favicon: "https://www.google.com/s2/favicons?domain=linear.app&sz=64",
  },
  {
    title: "Vercel",
    domain: "vercel.com",
    url: "https://vercel.com",
    date: "Sep 10",
    favicon: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
  },
  {
    title: "shadcn/ui",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com",
    date: "Sep 09",
    favicon: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64",
  },
] as const;

export const demoVideos = [
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
  },
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
  },
  {
    title: "Manage Tab Sessions",
    description:
      "Turn your open tabs into organized sessions. Clean up your browser without losing your research progress.",
    src: "/assets/videos/tab-sessions.mp4",
    accentColor: "bg-highlight-sessions",
    highlights: [
      "Bulk save multiple tabs",
      "Restore sessions in one click",
      "Memory-efficient tab sleeping",
    ],
  },
  {
    title: "X (Twitter) Integration",
    description:
      "Sync your X bookmarks directly into Reway. Search and organize your saved threads and tweets in a calm environment.",
    src: "/assets/videos/x-bookmarks.mp4",
    accentColor: "bg-highlight-x",
    highlights: [
      "Automatic thread detection",
      "Beautifully formatted tweets",
      "Deep search within saved X links",
    ],
  },
] as const;
