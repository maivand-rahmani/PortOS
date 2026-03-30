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

  window.localStorage.setItem(TERMINAL_PENDING_REQUEST_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<TerminalExternalRequestDetail>(TERMINAL_EXTERNAL_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumePendingTerminalExternalRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(TERMINAL_PENDING_REQUEST_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as TerminalExternalRequestDetail;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(TERMINAL_PENDING_REQUEST_KEY);

    return parsed;
  } catch {
    return null;
  }
}
