export { cn } from "./cn";
export {
  AGENT_NOTES_PREFILL_EVENT,
  consumeAgentNotesPrefill,
  dispatchAgentNotesPrefill,
  type AgentNotesPrefillDetail,
} from "./agent-os-events";
export {
  CLOCK_FOCUS_REQUEST_EVENT,
  consumeClockFocusRequest,
  dispatchClockFocusRequest,
  type ClockFocusRequest,
} from "./clock-os-events";
export {
  NOTES_EXTERNAL_REQUEST_EVENT,
  consumeNotesExternalRequest,
  dispatchNotesExternalRequest,
  type NotesExternalRequestDetail,
  type NotesExternalRequestMode,
} from "./notes-os-events";
export {
  TERMINAL_EXTERNAL_REQUEST_EVENT,
  consumePendingTerminalExternalRequest,
  dispatchTerminalExternalRequest,
  type TerminalExternalRequestDetail,
} from "./terminal-os-events";
export { calculateExpression } from "./app-logic";
export { slugifyDocsHeading } from "./docs";
export {
  closeWindowById,
  focusOrOpenAppById,
  focusWindowById,
  getRuntimeSnapshot,
  maximizeWindowById,
  minimizeWindowById,
  openAppById,
  openClockWithFocus,
  openNotesWithPrefill,
  openNotesWithRequest,
  openTerminalWithCommand,
  openTerminalWithRequest,
  restoreWindowById,
  terminateProcessById,
} from "./os-actions";
export { getProfileBasics } from "./project-data";
