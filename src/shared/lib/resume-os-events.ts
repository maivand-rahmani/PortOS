import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

export const RESUME_FOCUS_REQUEST_EVENT = "portos:resume-focus-request";
const RESUME_FOCUS_REQUEST_STORAGE_KEY = "portos-resume-focus-request";

export type ResumeSectionTarget = "overview" | "timeline" | "education" | "skills" | "playbook";

export type ResumeLensTarget = "balanced" | "frontend" | "product" | "ai" | "growth";

export type ResumeFocusRequest = {
  sectionId?: ResumeSectionTarget;
  projectId?: string;
  lensId?: ResumeLensTarget;
  source?: string;
  targetWindowId?: string;
};

export function dispatchResumeFocusRequest(detail: ResumeFocusRequest) {
  if (typeof window === "undefined") {
    return;
  }

  dispatchWindowRequest(
    RESUME_FOCUS_REQUEST_STORAGE_KEY,
    RESUME_FOCUS_REQUEST_EVENT,
    detail,
  );
}

export function consumeResumeFocusRequest(targetWindowId?: string) {
  return consumeWindowRequest<ResumeFocusRequest>(
    RESUME_FOCUS_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
