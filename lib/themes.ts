export type DashboardPaletteTheme =
  | "default"
  | "amber-minimal"
  | "amethyst-haze"
  | "claude"
  | "modern-minimal"
  | "notebook"
  | "supabase"
  | "t3-chat"
  | "perplexity"
  | "sage-green"
  | "sunset-horizon"
  | "cyberpunk"
  | "kodama-grove"
  | "crimson"
  | "retro"
  | "tangerine"
  | "vercel"
  | "vintage-paper"
  | "bubblegum";

export interface DashboardThemeDefinition {
  value: DashboardPaletteTheme;
  label: string;
  dots: [string, string, string];
}

export const DASHBOARD_THEMES: DashboardThemeDefinition[] = [
  {
    value: "default",
    label: "Default",
    // foreground, light neutral, background-based tint
    dots: [
      "oklch(0.21 0 0)",
      "oklch(0.96 0.03 236.8242)",
      "oklch(0.95 0.015 95)",
    ],
  },
  {
    value: "amber-minimal",
    label: "Amber Minimal",
    dots: [
      "oklch(0.7686 0.1647 70.0804)",
      "oklch(0.9869 0.05 95.2774)",
      "oklch(0.95 0.02 95.2774)",
    ],
  },
  {
    value: "amethyst-haze",
    label: "Amethyst Haze",
    dots: [
      "oklch(0.6104 0.0767 299.7335)",
      "oklch(0.7889 0.11 359.9375)",
      "oklch(0.93 0.02 301.4256)",
    ],
  },
  {
    value: "claude",
    label: "Claude",
    dots: [
      "oklch(0.6171 0.1375 39.0427)",
      "oklch(0.9245 0.04 92.9892)",
      "oklch(0.95 0.015 95.0986)",
    ],
  },
  {
    value: "modern-minimal",
    label: "Modern Minimal",
    dots: [
      "oklch(0.6231 0.1880 259.8145)",
      "oklch(0.9514 0.06 236.8242)",
      "oklch(0.96 0.02 264.5419)",
    ],
  },
  {
    value: "notebook",
    label: "Notebook",
    dots: [
      "oklch(0.4891 0 0)",
      "oklch(0.9354 0.07 94.8549)",
      "oklch(0.96 0.01 0)",
    ],
  },
  {
    value: "supabase",
    label: "Supabase",
    dots: [
      "oklch(0.8348 0.1302 160.9080)",
      "oklch(0.9461 0.03 160.9080)",
      "oklch(0.96 0.02 160.9080)",
    ],
  },
  {
    value: "t3-chat",
    label: "T3 Chat",
    dots: [
      "oklch(0.5316 0.1409 355.1999)",
      "oklch(0.8696 0.11 334.8991)",
      "oklch(0.94 0.03 334.8991)",
    ],
  },
  {
    value: "perplexity",
    label: "Perplexity",
    dots: [
      "oklch(0.5322 0.0910 205.7465)",
      "oklch(0.9410 0.05 196.8866)",
      "oklch(0.95 0.02 205.7465)",
    ],
  },
  {
    value: "sage-green",
    label: "Sage Green",
    dots: [
      "oklch(0.72 0.06 132.7370)",
      "oklch(0.9300 0.02 134.8996)",
      "oklch(0.93 0.01 247.8763)",
    ],
  },
  {
    value: "sunset-horizon",
    label: "Sunset Horizon",
    dots: [
      "oklch(0.7357 0.1641 34.7091)",
      "oklch(0.8278 0.1131 57.9984)",
      "oklch(0.9856 0.0084 56.3169)",
    ],
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    dots: [
      "oklch(0.78 0.20 88.7734)",
      "oklch(0.7484 0.18 233.2517)",
      "oklch(0.99 0.01 0)",
    ],
  },
  {
    value: "kodama-grove",
    label: "Kodama Grove",
    dots: [
      "oklch(0.6657 0.1050 118.9078)",
      "oklch(0.8361 0.0713 90.3269)",
      "oklch(0.8798 0.0534 91.7893)",
    ],
  },
  {
    value: "crimson",
    label: "Crimson",
    dots: [
      "oklch(0.4650 0.1470 24.9381)",
      "oklch(0.9619 0.0580 95.6174)",
      "oklch(0.9779 0.0042 56.3756)",
    ],
  },
  {
    value: "retro",
    label: "Retro",
    dots: [
      "oklch(0.5924 0.2025 355.8943)",
      "oklch(0.6437 0.1019 187.3840)",
      "oklch(0.9735 0.0261 90.0953)",
    ],
  },
  {
    value: "tangerine",
    label: "Tangerine",
    dots: [
      "oklch(0.6397 0.1720 36.4421)",
      "oklch(0.9119 0.0222 243.8174)",
      "oklch(0.9383 0.0042 236.4993)",
    ],
  },
  {
    value: "vercel",
    label: "Vercel",
    dots: [
      "oklch(0 0 0)",
      "oklch(0.9400 0 0)",
      "oklch(0.9900 0 0)",
    ],
  },
  {
    value: "vintage-paper",
    label: "Vintage Paper",
    dots: [
      "oklch(0.6180 0.0778 65.5444)",
      "oklch(0.8348 0.0426 88.8064)",
      "oklch(0.9582 0.0152 90.2357)",
    ],
  },
  {
    value: "bubblegum",
    label: "Bubblegum",
    dots: [
      "oklch(0.6209 0.1801 348.1385)",
      "oklch(0.9195 0.0801 87.6670)",
      "oklch(0.9399 0.0203 345.6985)",
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
