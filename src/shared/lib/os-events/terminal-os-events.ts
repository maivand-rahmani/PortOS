import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

export const TERMINAL_EXTERNAL_REQUEST_EVENT = "portos:terminal-external-request";
const TERMINAL_PENDING_REQUEST_KEY = "portos-terminal-pending-request";

export type TerminalExternalRequestDetail = {
  command: string;
  execute?: boolean;
  source?: string;
  targetWindowId?: string;
};

export function dispatchTerminalExternalRequest(detail: TerminalExternalRequestDetail) {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(
    TERMINAL_PENDING_REQUEST_KEY,
    TERMINAL_EXTERNAL_REQUEST_EVENT,
    detail,
  );
}

export function consumePendingTerminalExternalRequest(targetWindowId?: string) {
  return consumeWindowRequest<TerminalExternalRequestDetail>(
    TERMINAL_PENDING_REQUEST_KEY,
    targetWindowId,
  );
}
