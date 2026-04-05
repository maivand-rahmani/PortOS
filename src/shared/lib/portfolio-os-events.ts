import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

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

  dispatchWindowRequest(
    PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY,
    PORTFOLIO_FOCUS_REQUEST_EVENT,
    detail,
  );
}

export function consumePortfolioFocusRequest(targetWindowId?: string) {
  return consumeWindowRequest<PortfolioFocusRequest>(
    PORTFOLIO_FOCUS_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
