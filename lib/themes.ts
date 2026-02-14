export type DashboardPaletteTheme =
  | "default"
  | "amber-minimal"
  | "amethyst-haze"
  | "claude"
  | "modern-minimal"
  | "notebook"
  | "supabase"
  | "t3-chat"
  | "perplexity";

export interface DashboardThemeDefinition {
  value: DashboardPaletteTheme;
  label: string;
  dots: [string, string, string];
}

export const DASHBOARD_THEMES: DashboardThemeDefinition[] = [
  {
    value: "default",
    label: "Default",
    dots: ["oklch(1 0 0)", "oklch(0.21 0 0)", "oklch(0.96 0 0)"],
  },
  {
    value: "amber-minimal",
    label: "Amber Minimal",
    dots: [
      "oklch(1.0000 0 0)",
      "oklch(0.7686 0.1647 70.0804)",
      "oklch(0.9869 0.0214 95.2774)",
    ],
  },
  {
    value: "amethyst-haze",
    label: "Amethyst Haze",
    dots: [
      "oklch(0.9777 0.0041 301.4256)",
      "oklch(0.6104 0.0767 299.7335)",
      "oklch(0.7889 0.0802 359.9375)",
    ],
  },
  {
    value: "claude",
    label: "Claude",
    dots: [
      "oklch(0.9818 0.0054 95.0986)",
      "oklch(0.6171 0.1375 39.0427)",
      "oklch(0.9245 0.0138 92.9892)",
    ],
  },
  {
    value: "modern-minimal",
    label: "Modern Minimal",
    dots: [
      "oklch(1.0000 0 0)",
      "oklch(0.6231 0.1880 259.8145)",
      "oklch(0.9514 0.0250 236.8242)",
    ],
  },
  {
    value: "notebook",
    label: "Notebook",
    dots: [
      "oklch(0.9821 0 0)",
      "oklch(0.4891 0 0)",
      "oklch(0.9354 0.0456 94.8549)",
    ],
  },
  {
    value: "supabase",
    label: "Supabase",
    dots: [
      "oklch(0.9911 0 0)",
      "oklch(0.8348 0.1302 160.9080)",
      "oklch(0.9461 0 0)",
    ],
  },
  {
    value: "t3-chat",
    label: "T3 Chat",
    dots: [
      "oklch(0.9754 0.0084 325.6414)",
      "oklch(0.5316 0.1409 355.1999)",
      "oklch(0.8696 0.0675 334.8991)",
    ],
  },
  {
    value: "perplexity",
    label: "Perplexity",
    dots: [
      "oklch(0.9902 0.0039 106.4715)",
      "oklch(0.5322 0.0910 205.7465)",
      "oklch(0.9410 0.0159 196.8866)",
    ],
  },
];

export function isDashboardPaletteTheme(
  value: string,
): value is DashboardPaletteTheme {
  return DASHBOARD_THEMES.some((theme) => theme.value === value);
}

export function getPaletteThemeClassName(theme: DashboardPaletteTheme) {
  if (theme === "default") return "";
  return `theme-${theme}`;
}
