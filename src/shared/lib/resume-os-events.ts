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

  window.localStorage.setItem(RESUME_FOCUS_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<ResumeFocusRequest>(RESUME_FOCUS_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumeResumeFocusRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(RESUME_FOCUS_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ResumeFocusRequest;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(RESUME_FOCUS_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
