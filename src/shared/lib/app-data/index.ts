export {
  calculateExpression,
  buildFormattedWorldClockTime,
  blogPosts,
  validateContactSubmission,
  runTerminalCommand,
  type BlogPost,
  type ContactSubmission,
  type TerminalResult,
  type TerminalWindowAction,
  type TerminalWindowActionType,
  type TerminalProcessAction,
} from "./app-logic";
export {
  slugifyDocsHeading,
  type DocsHeading,
  type DocsDocument,
} from "./docs";
export { getProfileBasics } from "./project-data";
export {
  WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  getWallpaperById,
  type Wallpaper,
} from "./wallpapers";
