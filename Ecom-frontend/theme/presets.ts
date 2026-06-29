export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  sidebar: string; // admin sidebar background
  gradient: [string, string]; // brand mark + auth art panel
}

/** Five professional, enterprise-grade color presets. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "indigo",
    name: "Indigo",
    description: "Modern indigo → violet. The default.",
    primary: "#4F46E5",
    primaryDark: "#312E81",
    secondary: "#7C3AED",
    sidebar: "#1D1C4D",
    gradient: ["#4F46E5", "#7C3AED"],
  },
  {
    id: "corporate",
    name: "Corporate Blue",
    description: "Trustworthy, classic SaaS blue.",
    primary: "#2563EB",
    primaryDark: "#1E3A8A",
    secondary: "#0EA5E9",
    sidebar: "#0F172A",
    gradient: ["#1E3A8A", "#2563EB"],
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Fresh, confident green.",
    primary: "#059669",
    primaryDark: "#065F46",
    secondary: "#10B981",
    sidebar: "#064E3B",
    gradient: ["#065F46", "#059669"],
  },
  {
    id: "royal",
    name: "Royal Violet",
    description: "Premium, boutique violet.",
    primary: "#7C3AED",
    primaryDark: "#5B21B6",
    secondary: "#C026D3",
    sidebar: "#2E1065",
    gradient: ["#5B21B6", "#7C3AED"],
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Minimal ink with an amber accent.",
    primary: "#111827",
    primaryDark: "#030712",
    secondary: "#D97706",
    sidebar: "#111827",
    gradient: ["#1F2937", "#111827"],
  },
];

export const DEFAULT_PRESET_ID = "indigo";

export const getPreset = (id?: string): ThemePreset =>
  THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
