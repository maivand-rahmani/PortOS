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

  window.localStorage.setItem(CLOCK_FOCUS_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<ClockFocusRequest>(CLOCK_FOCUS_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumeClockFocusRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(CLOCK_FOCUS_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ClockFocusRequest;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(CLOCK_FOCUS_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
