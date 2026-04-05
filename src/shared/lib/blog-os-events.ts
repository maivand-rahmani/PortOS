import {
  consumeWindowRequest,
  dispatchWindowRequest,
} from "./window-request-bus";

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

  dispatchWindowRequest(
    BLOG_FOCUS_REQUEST_STORAGE_KEY,
    BLOG_FOCUS_REQUEST_EVENT,
    detail,
  );
}

export function consumeBlogFocusRequest(targetWindowId?: string) {
  return consumeWindowRequest<BlogFocusRequest>(
    BLOG_FOCUS_REQUEST_STORAGE_KEY,
    targetWindowId,
  );
}
