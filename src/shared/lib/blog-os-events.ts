export const BLOG_FOCUS_REQUEST_EVENT = "portos:blog-focus-request";
const BLOG_FOCUS_REQUEST_STORAGE_KEY = "portos-blog-focus-request";

export type BlogFocusRequest = {
  postId?: string;
  query?: string;
  addToQueue?: boolean;
  source?: string;
  targetWindowId?: string;
};

export function dispatchBlogFocusRequest(detail: BlogFocusRequest) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BLOG_FOCUS_REQUEST_STORAGE_KEY, JSON.stringify(detail));

  window.dispatchEvent(
    new CustomEvent<BlogFocusRequest>(BLOG_FOCUS_REQUEST_EVENT, {
      detail,
    }),
  );
}

export function consumeBlogFocusRequest(targetWindowId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(BLOG_FOCUS_REQUEST_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as BlogFocusRequest;

    if (parsed.targetWindowId && targetWindowId && parsed.targetWindowId !== targetWindowId) {
      return null;
    }

    if (parsed.targetWindowId && !targetWindowId) {
      return null;
    }

    window.localStorage.removeItem(BLOG_FOCUS_REQUEST_STORAGE_KEY);

    return parsed;
  } catch {
    return null;
  }
}
