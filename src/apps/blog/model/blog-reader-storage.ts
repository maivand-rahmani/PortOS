import { PERSISTED_FILE_PATHS } from "@/shared/lib";
import { readJsonAtPath, writeJsonAtPath } from "@/shared/lib/fs/fs-actions";

export type BlogHighlight = {
  id: string;
  postId: string;
  quote: string;
  note: string;
  createdAt: string;
};

export type BlogReaderState = {
  queuedPostIds: string[];
  completedPostIds: string[];
  highlights: BlogHighlight[];
};

const EMPTY_READER_STATE: BlogReaderState = {
  queuedPostIds: [],
  completedPostIds: [],
  highlights: [],
};

function uniquePostIds(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isBlogHighlight(value: unknown): value is BlogHighlight {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as BlogHighlight;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.postId === "string" &&
    typeof candidate.quote === "string" &&
    typeof candidate.note === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function normalizeReaderState(parsed: Partial<BlogReaderState> | null | undefined): BlogReaderState {
  return {
    queuedPostIds: uniquePostIds(parsed?.queuedPostIds ?? []),
    completedPostIds: uniquePostIds(parsed?.completedPostIds ?? []),
    highlights: Array.isArray(parsed?.highlights)
      ? parsed.highlights.filter(isBlogHighlight)
      : [],
  };
}

export async function readStoredBlogReaderState(): Promise<BlogReaderState> {
  const parsed = await readJsonAtPath<Partial<BlogReaderState>>(
    PERSISTED_FILE_PATHS.blogReaderState,
  );

  return normalizeReaderState(parsed);
}

export async function saveBlogReaderState(state: BlogReaderState) {
  await writeJsonAtPath(PERSISTED_FILE_PATHS.blogReaderState, {
    queuedPostIds: uniquePostIds(state.queuedPostIds),
    completedPostIds: uniquePostIds(state.completedPostIds),
    highlights: state.highlights,
  });
}

export function addPostToQueue(state: BlogReaderState, postId: string): BlogReaderState {
  return {
    ...state,
    queuedPostIds: uniquePostIds([postId, ...state.queuedPostIds]),
    completedPostIds: state.completedPostIds.filter((value) => value !== postId),
  };
}

export function ensurePostQueued(state: BlogReaderState, postId: string): BlogReaderState {
  return state.queuedPostIds.includes(postId) ? state : addPostToQueue(state, postId);
}

export function removePostFromQueue(state: BlogReaderState, postId: string): BlogReaderState {
  return {
    ...state,
    queuedPostIds: state.queuedPostIds.filter((value) => value !== postId),
  };
}

export function toggleQueuedPost(state: BlogReaderState, postId: string): BlogReaderState {
  return state.queuedPostIds.includes(postId) ? removePostFromQueue(state, postId) : addPostToQueue(state, postId);
}

export function toggleCompletedPost(state: BlogReaderState, postId: string): BlogReaderState {
  const isCompleted = state.completedPostIds.includes(postId);

  return {
    ...state,
    queuedPostIds: isCompleted ? state.queuedPostIds : state.queuedPostIds.filter((value) => value !== postId),
    completedPostIds: isCompleted
      ? state.completedPostIds.filter((value) => value !== postId)
      : uniquePostIds([postId, ...state.completedPostIds]),
  };
}

export function createBlogHighlight(input: {
  postId: string;
  quote?: string;
  note?: string;
}): BlogHighlight | null {
  const quote = input.quote?.trim() ?? "";
  const note = input.note?.trim() ?? "";

  if (!quote && !note) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    postId: input.postId,
    quote,
    note,
    createdAt: new Date().toISOString(),
  };
}

export function addBlogHighlight(state: BlogReaderState, highlight: BlogHighlight): BlogReaderState {
  return {
    ...state,
    highlights: [highlight, ...state.highlights],
  };
}

export function removeBlogHighlight(state: BlogReaderState, highlightId: string): BlogReaderState {
  return {
    ...state,
    highlights: state.highlights.filter((highlight) => highlight.id !== highlightId),
  };
}

export function getPostHighlights(state: BlogReaderState, postId: string | null | undefined) {
  if (!postId) {
    return [];
  }

  return state.highlights.filter((highlight) => highlight.postId === postId);
}
