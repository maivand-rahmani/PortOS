export { cn } from "./cn/cn";
export {
  FILE_SYSTEM_CHANGE_EVENT,
  isFileSystemChangeForPath,
  isFileSystemChangeWithinPath,
  subscribeToFileSystemChanges,
  type FileSystemChangeDetail,
  type FileSystemChangeType,
} from "./fs/fs-events";
export {
  NOTES_FILE_EXTENSION,
  PERSISTED_FILE_PATHS,
  SYSTEM_APP_DIRECTORIES,
  SYSTEM_APPS_ROOT,
  SYSTEM_CACHE_DIRECTORIES,
  SYSTEM_CACHE_ROOT,
  SYSTEM_ROOT,
  SYSTEM_SHARED_DIRECTORIES,
  SYSTEM_SHARED_ROOT,
  SYSTEM_USER_DIRECTORIES,
  SYSTEM_USER_ROOT,
} from "./fs/fs-paths";
export {
  AGENT_NOTES_PREFILL_EVENT,
  AI_AGENT_EXTERNAL_PROMPT_EVENT,
  AI_AGENT_EXTERNAL_REQUEST_EVENT,
  clearPendingAgentRequest,
  consumeAgentNotesPrefill,
  consumePendingAgentRequest,
  dispatchAgentNotesPrefill,
  dispatchAgentRequest,
  normalizeAgentExternalRequest,
  type AgentExternalRequest,
  type AgentNotesPrefillDetail,
} from "./os-events/agent-os-events";
export {
  BLOG_FOCUS_REQUEST_EVENT,
  consumeBlogFocusRequest,
  dispatchBlogFocusRequest,
  type BlogFocusRequest,
} from "./os-events/blog-os-events";
export {
  CLOCK_FOCUS_REQUEST_EVENT,
  consumeClockFocusRequest,
  dispatchClockFocusRequest,
  type ClockFocusRequest,
} from "./os-events/clock-os-events";
export {
  NOTES_EXTERNAL_REQUEST_EVENT,
  consumeNotesExternalRequest,
  dispatchNotesExternalRequest,
  type NotesExternalRequestDetail,
  type NotesExternalRequestMode,
} from "./os-events/notes-os-events";
export {
  PORTFOLIO_FOCUS_REQUEST_EVENT,
  consumePortfolioFocusRequest,
  dispatchPortfolioFocusRequest,
  type PortfolioFocusRequest,
  type PortfolioHandoffTarget,
} from "./os-events/portfolio-os-events";
export {
  RESUME_FOCUS_REQUEST_EVENT,
  consumeResumeFocusRequest,
  dispatchResumeFocusRequest,
  type ResumeFocusRequest,
  type ResumeLensTarget,
  type ResumeSectionTarget,
} from "./os-events/resume-os-events";
export {
  SYSTEM_INFO_EXTERNAL_REQUEST_EVENT,
  consumeSystemInfoExternalRequest,
  dispatchSystemInfoExternalRequest,
  type SystemInfoExternalRequestDetail,
  type SystemInfoExternalSection,
} from "./os-events/system-info-os-events";
export {
  TERMINAL_EXTERNAL_REQUEST_EVENT,
  consumePendingTerminalExternalRequest,
  dispatchTerminalExternalRequest,
  type TerminalExternalRequestDetail,
} from "./os-events/terminal-os-events";
export { calculateExpression } from "./app-data/app-logic";
export { slugifyDocsHeading } from "./app-data/docs";
export {
  closeWindowById,
  closeAiPalette,
  focusOrOpenAppById,
  focusWindowById,
  getRuntimeSnapshot,
  maximizeWindowById,
  minimizeWindowById,
  openAppById,
  openAgentWithRequest,
  openAiPalette,
  openBlogWithFocus,
  openClockWithFocus,
  openNotesWithPrefill,
  openNotesWithRequest,
  openPortfolioWithFocus,
  openResumeWithFocus,
  openSystemInfoWithRequest,
  openTerminalWithCommand,
  openTerminalWithRequest,
  restoreWindowById,
  terminateProcessById,
} from "./os-actions/os-actions";
export { getProfileBasics } from "./app-data/project-data";
export { runDataMigration, type MigrationResult } from "./fs/fs-migration";
