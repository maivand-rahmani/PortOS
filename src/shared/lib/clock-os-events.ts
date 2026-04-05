import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

export const CLOCK_FOCUS_REQUEST_EVENT = "portos:clock-focus-request";
const CLOCK_FOCUS_REQUEST_STORAGE_KEY = "portos-clock-focus-request";

export type ClockFocusRequest = {
  timeZone: string;
  source?: string;
  highlight?: boolean;
  targetWindowId?: string;
};

export function dispatchClockFocusRequest(detail: ClockFocusRequest) {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(
    CLOCK_FOCUS_REQUEST_STORAGE_KEY,
    CLOCK_FOCUS_REQUEST_EVENT,
    detail,
  );
}

export function consumeClockFocusRequest(targetWindowId?: string) {
  return consumeWindowRequest<ClockFocusRequest>(
    CLOCK_FOCUS_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
