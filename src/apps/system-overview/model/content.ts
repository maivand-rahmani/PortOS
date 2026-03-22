export const systemOverviewSections = [
  {
    title: "Window Manager",
    description:
      "Opens, focuses, layers, and closes runtime windows while keeping the active window predictable.",
  },
  {
    title: "Process Manager",
    description:
      "Tracks every active process instance and links it to the window it owns inside the system.",
  },
  {
    title: "App Registry",
    description:
      "Stores metadata for apps in src/apps and lazy-loads their UI only when the OS launches them.",
  },
] as const;
