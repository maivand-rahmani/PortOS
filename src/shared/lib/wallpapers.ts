export type Wallpaper = {
  id: string;
  name: string;
  gradient: string;
  overlay: string;
  orb1: string;
  orb2: string;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "default",
    name: "Sierra",
    gradient:
      "linear-gradient(160deg,#d6dbe8 0%,#b7c3da 18%,#7d93bb 38%,#53688f 57%,#1f3154 82%,#0b1628 100%)",
    overlay:
      "radial-gradient(circle at 18% 18%,rgba(255,255,255,0.42),transparent 18%),radial-gradient(circle at 74% 22%,rgba(255,255,255,0.18),transparent 16%),radial-gradient(circle at 50% 100%,rgba(106,162,255,0.35),transparent 38%)",
    orb1: "rgba(255,255,255,0.12)",
    orb2: "rgba(125,211,252,0.18)",
  },
  {
    id: "midnight",
    name: "Midnight",
    gradient:
      "linear-gradient(160deg,#1e1b4b 0%,#1a1145 20%,#0f172a 50%,#020617 100%)",
    overlay:
      "radial-gradient(circle at 20% 20%,rgba(139,92,246,0.3),transparent 25%),radial-gradient(circle at 80% 80%,rgba(59,130,246,0.2),transparent 25%)",
    orb1: "rgba(139,92,246,0.15)",
    orb2: "rgba(37,99,235,0.12)",
  },
  {
    id: "sunset",
    name: "Sunset",
    gradient:
      "linear-gradient(160deg,#fecdd3 0%,#fda4af 15%,#fb7185 35%,#e11d48 60%,#9f1239 85%,#4c0519 100%)",
    overlay:
      "radial-gradient(circle at 30% 15%,rgba(255,255,255,0.45),transparent 22%),radial-gradient(circle at 70% 90%,rgba(251,191,36,0.3),transparent 30%)",
    orb1: "rgba(255,255,255,0.18)",
    orb2: "rgba(251,191,36,0.15)",
  },
  {
    id: "aurora",
    name: "Aurora",
    gradient:
      "linear-gradient(160deg,#064e3b 0%,#065f46 20%,#047857 40%,#0d9488 60%,#14b8a6 80%,#0f766e 100%)",
    overlay:
      "radial-gradient(circle at 25% 25%,rgba(52,211,153,0.35),transparent 25%),radial-gradient(circle at 75% 60%,rgba(34,211,238,0.25),transparent 30%),radial-gradient(circle at 50% 90%,rgba(167,243,208,0.2),transparent 25%)",
    orb1: "rgba(52,211,153,0.18)",
    orb2: "rgba(34,211,238,0.15)",
  },
  {
    id: "ocean",
    name: "Ocean",
    gradient:
      "linear-gradient(160deg,#cffafe 0%,#67e8f9 15%,#22d3ee 30%,#0891b2 55%,#155e75 80%,#0c4a6e 100%)",
    overlay:
      "radial-gradient(circle at 20% 20%,rgba(255,255,255,0.4),transparent 20%),radial-gradient(circle at 80% 30%,rgba(255,255,255,0.15),transparent 18%),radial-gradient(circle at 50% 100%,rgba(6,182,212,0.3),transparent 35%)",
    orb1: "rgba(255,255,255,0.15)",
    orb2: "rgba(103,232,249,0.20)",
  },
  {
    id: "rose",
    name: "Rose",
    gradient:
      "linear-gradient(160deg,#fce7f3 0%,#f9a8d4 18%,#f472b6 38%,#ec4899 58%,#be185d 82%,#831843 100%)",
    overlay:
      "radial-gradient(circle at 22% 18%,rgba(255,255,255,0.45),transparent 20%),radial-gradient(circle at 78% 75%,rgba(251,207,232,0.3),transparent 28%)",
    orb1: "rgba(255,255,255,0.16)",
    orb2: "rgba(249,168,212,0.18)",
  },
  {
    id: "forest",
    name: "Forest",
    gradient:
      "linear-gradient(160deg,#d9f99d 0%,#a3e635 15%,#65a30d 35%,#3f6212 60%,#1a2e05 85%,#052e16 100%)",
    overlay:
      "radial-gradient(circle at 25% 20%,rgba(255,255,255,0.35),transparent 20%),radial-gradient(circle at 70% 80%,rgba(132,204,22,0.25),transparent 30%)",
    orb1: "rgba(255,255,255,0.12)",
    orb2: "rgba(163,230,53,0.15)",
  },
  {
    id: "slate",
    name: "Slate",
    gradient:
      "linear-gradient(160deg,#f1f5f9 0%,#e2e8f0 18%,#94a3b8 40%,#64748b 60%,#334155 82%,#0f172a 100%)",
    overlay:
      "radial-gradient(circle at 20% 15%,rgba(255,255,255,0.5),transparent 22%),radial-gradient(circle at 80% 85%,rgba(148,163,184,0.2),transparent 25%)",
    orb1: "rgba(255,255,255,0.18)",
    orb2: "rgba(148,163,184,0.12)",
  },
];

export const DEFAULT_WALLPAPER_ID = "default";

export const WALLPAPER_STORAGE_KEY = "portos-wallpaper-id";

export function getStoredWallpaperId(): string {
  if (typeof window === "undefined") {
    return DEFAULT_WALLPAPER_ID;
  }

  return window.localStorage.getItem(WALLPAPER_STORAGE_KEY) ?? DEFAULT_WALLPAPER_ID;
}

export function setStoredWallpaperId(id: string) {
  window.localStorage.setItem(WALLPAPER_STORAGE_KEY, id);
}

export function getWallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
