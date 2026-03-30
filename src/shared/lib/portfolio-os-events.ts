export const PORTFOLIO_FOCUS_REQUEST_EVENT = "portos:portfolio-focus-request";
const PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY = "portos-portfolio-focus-request";

export type PortfolioHandoffTarget = "recruiter" | "client" | "technical";

export type PortfolioFocusRequest = {
  projectId?: string;
  filterId?: string;
  handoffId?: PortfolioHandoffTarget;
  source?: string;
  targetWindowId?: string;
};

export function dispatchPortfolioFocusRequest(detail: PortfolioFocusRequest) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<PortfolioFocusRequest>(PORTFOLIO_FOCUS_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumePortfolioFocusRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as PortfolioFocusRequest;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
