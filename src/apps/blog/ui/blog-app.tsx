"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import type { BlogPost } from "@/shared/lib/app-data/app-logic";
import {
  BLOG_FOCUS_REQUEST_EVENT,
  consumeBlogFocusRequest,
  openAgentWithRequest,
  openNotesWithRequest,
  openPortfolioWithFocus,
  type BlogFocusRequest,
} from "@/shared/lib";

import { buildBlogAgentRequest, buildBlogNoteRequest, resolveBlogPortfolioFocus } from "../model/blog-handoffs";
import { buildBlogAiContext } from "../model/blog-ai-context";
import {
  addBlogHighlight,
  createBlogHighlight,
  ensurePostQueued,
  getPostHighlights,
  readStoredBlogReaderState,
  removeBlogHighlight,
  removePostFromQueue,
  saveBlogReaderState,
  toggleCompletedPost,
  toggleQueuedPost,
  type BlogReaderState,
} from "../model/blog-reader-storage";
import { BlogPostList } from "./blog-post-list";
import { BlogPostView } from "./blog-post-view";
import { BlogReaderHeader } from "./blog-reader-header";
import { BlogReadingSidebar } from "./blog-reading-sidebar";

type BlogPayload = {
  posts: BlogPost[];
};

function describeRequestSource(source: string | undefined) {
  if (!source) {
    return "another app";
  }

  return source.replace(/[:_-]+/g, " ");
}

export function BlogApp({ processId, windowId }: AppComponentProps) {
  const fsHydrated = useOSStore((state) => state.fsHydrated);
  const aiPublishWindowContext = useOSStore((state) => state.aiPublishWindowContext);
  const aiClearWindowContext = useOSStore((state) => state.aiClearWindowContext);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [highlightDraft, setHighlightDraft] = useState("");
  const [readerState, setReaderState] = useState<BlogReaderState>({
    queuedPostIds: [],
    completedPostIds: [],
    highlights: [],
  });
  const [readerStateHydrated, setReaderStateHydrated] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Search the archive, save takeaways, and move a useful post into Notes or the AI agent.");
  const [loadError, setLoadError] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.excerpt, post.body, ...post.tags].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [posts, query]);

  const activePost = useMemo(
    () => filteredPosts.find((post) => post.id === activePostId) ?? posts.find((post) => post.id === activePostId) ?? filteredPosts[0] ?? posts[0] ?? null,
    [activePostId, filteredPosts, posts],
  );

  const activeHighlights = useMemo(() => getPostHighlights(readerState, activePost?.id), [activePost?.id, readerState]);
  const queuedPosts = useMemo(
    () => readerState.queuedPostIds.map((postId) => posts.find((post) => post.id === postId)).filter((post): post is BlogPost => Boolean(post)),
    [posts, readerState.queuedPostIds],
  );
  const completedCount = readerState.completedPostIds.length;
  const relatedPortfolio = activePost ? resolveBlogPortfolioFocus(activePost) : null;

  useEffect(() => {
    if (!fsHydrated) {
      return;
    }

    let cancelled = false;

    const hydrateReaderState = async () => {
      const stored = await readStoredBlogReaderState();

      if (!cancelled) {
        setReaderState(stored);
        setReaderStateHydrated(true);
      }
    };

    void hydrateReaderState();

    return () => {
      cancelled = true;
    };
  }, [fsHydrated]);

  useEffect(() => {
    if (!fsHydrated || !readerStateHydrated) {
      return;
    }

    void saveBlogReaderState(readerState);
  }, [fsHydrated, readerState, readerStateHydrated]);

  useEffect(() => {
    setHighlightDraft("");
  }, [activePost?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const response = await fetch("/api/blog");

        if (!response.ok) {
          throw new Error(`Unable to load posts (${response.status})`);
        }

        const payload = (await response.json()) as BlogPayload;

        if (!cancelled) {
          setPosts(payload.posts);
          setActivePostId((current) => current ?? payload.posts[0]?.id ?? null);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to load posts.");
        }
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyFocusRequest = useCallback((request: BlogFocusRequest | null) => {
    if (!request) {
      return;
    }

    if (request.query !== undefined) {
      setQuery(request.query);
    }

    const requestedPostId = request.postId;

    if (requestedPostId) {
      setActivePostId(requestedPostId);

      if (request.addToQueue) {
        setReaderState((current) => ensurePostQueued(current, requestedPostId));
      }
    }

    setStatusMessage(`Focused from ${describeRequestSource(request.source)}.`);
  }, []);

  useEffect(() => {
    const pendingRequest = consumeBlogFocusRequest(windowId);

    if (pendingRequest) {
      applyFocusRequest(pendingRequest);
    }
  }, [applyFocusRequest, windowId]);

  useEffect(() => {
    const handleFocusRequest = (event: Event) => {
      const detail = (event as CustomEvent<BlogFocusRequest>).detail;

      if (detail.targetWindowId && detail.targetWindowId !== windowId) {
        return;
      }

      applyFocusRequest(detail);
    };

    window.addEventListener(BLOG_FOCUS_REQUEST_EVENT, handleFocusRequest);

    return () => {
      window.removeEventListener(BLOG_FOCUS_REQUEST_EVENT, handleFocusRequest);
    };
  }, [applyFocusRequest, windowId]);

  useEffect(() => {
    aiPublishWindowContext(
      windowId,
      buildBlogAiContext({
        windowId,
        activePostTitle: activePost?.title ?? null,
        activePostId: activePost?.id ?? null,
        postCount: posts.length,
        query,
        queuedCount: readerState.queuedPostIds.length,
        completedCount,
        highlightCount: activeHighlights.length,
      }),
    );
  }, [activeHighlights.length, activePost, completedCount, aiPublishWindowContext, posts.length, query, readerState.queuedPostIds.length, windowId]);

  useEffect(() => {
    return () => {
      aiClearWindowContext(windowId);
    };
  }, [aiClearWindowContext, windowId]);

  const toggleQueue = useCallback(() => {
    if (!activePost) {
      return;
    }

    const nextQueued = !readerState.queuedPostIds.includes(activePost.id);

    setReaderState((current) => toggleQueuedPost(current, activePost.id));
    setStatusMessage(nextQueued ? `Queued ${activePost.title}.` : `Removed ${activePost.title} from the queue.`);
  }, [activePost, readerState.queuedPostIds]);

  const toggleComplete = useCallback(() => {
    if (!activePost) {
      return;
    }

    const nextCompleted = !readerState.completedPostIds.includes(activePost.id);

    setReaderState((current) => toggleCompletedPost(current, activePost.id));
    setStatusMessage(nextCompleted ? `Marked ${activePost.title} as finished.` : `Moved ${activePost.title} back to active reading.`);
  }, [activePost, readerState.completedPostIds]);

  const saveHighlight = useCallback(
    (input: { note?: string; quote?: string }, successMessage: string) => {
      if (!activePost) {
        return;
      }

      const highlight = createBlogHighlight({
        postId: activePost.id,
        quote: input.quote,
        note: input.note,
      });

      if (!highlight) {
        setStatusMessage("Write a note or save the excerpt before adding a highlight.");
        return;
      }

      setReaderState((current) => addBlogHighlight(current, highlight));
      setHighlightDraft("");
      setStatusMessage(successMessage);
    },
    [activePost],
  );

  const sendToNotes = useCallback(async () => {
    if (!activePost) {
      return;
    }

    await openNotesWithRequest(buildBlogNoteRequest(activePost, activeHighlights));
    setStatusMessage(`Sent ${activePost.title} to Notes as a reading brief.`);
  }, [activeHighlights, activePost]);

  const askAgent = useCallback(async () => {
    if (!activePost) {
      return;
    }

    await openAgentWithRequest(buildBlogAgentRequest(activePost, activeHighlights));
    setStatusMessage(`Sent ${activePost.title} to the AI agent for follow-up.`);
  }, [activeHighlights, activePost]);

  const openRelatedPortfolio = useCallback(async () => {
    if (!relatedPortfolio) {
      return;
    }

    await openPortfolioWithFocus(relatedPortfolio.request);
    setStatusMessage(`Opened ${relatedPortfolio.label} from the current post.`);
  }, [relatedPortfolio]);

  return (
    <div className="blog-app flex h-full flex-col gap-4 rounded-[28px] p-4">
      <BlogReaderHeader
        processId={processId}
        query={query}
        onQueryChange={setQuery}
        postCount={posts.length}
        queuedCount={readerState.queuedPostIds.length}
        completedCount={completedCount}
        statusMessage={loadError ? `Load error: ${loadError}` : statusMessage}
      />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <BlogPostList
          posts={filteredPosts}
          activePostId={activePost?.id ?? null}
          queuedPostIds={readerState.queuedPostIds}
          completedPostIds={readerState.completedPostIds}
          onSelect={setActivePostId}
        />

        <BlogPostView
          post={activePost}
          isQueued={activePost ? readerState.queuedPostIds.includes(activePost.id) : false}
          isCompleted={activePost ? readerState.completedPostIds.includes(activePost.id) : false}
          highlightDraft={highlightDraft}
          highlightCount={activeHighlights.length}
          relatedPortfolioLabel={relatedPortfolio?.label ?? null}
          onHighlightDraftChange={setHighlightDraft}
          onToggleQueue={toggleQueue}
          onToggleComplete={toggleComplete}
          onSaveExcerpt={() => saveHighlight({ quote: activePost?.excerpt }, `Saved the excerpt from ${activePost?.title ?? "this post"}.`)}
          onSaveNote={() => saveHighlight({ note: highlightDraft }, `Saved your reading note for ${activePost?.title ?? "this post"}.`)}
          onSendToNotes={sendToNotes}
          onAskAgent={askAgent}
          onOpenPortfolio={relatedPortfolio ? openRelatedPortfolio : null}
        />

        <BlogReadingSidebar
          queuedPosts={queuedPosts}
          activePostId={activePost?.id ?? null}
          highlights={activeHighlights}
          completedCount={completedCount}
          totalCount={posts.length}
          onSelectPost={setActivePostId}
          onRemoveFromQueue={(postId) => {
            setReaderState((current) => removePostFromQueue(current, postId));
            setStatusMessage("Removed a post from the queue.");
          }}
          onRemoveHighlight={(highlightId) => {
            setReaderState((current) => removeBlogHighlight(current, highlightId));
            setStatusMessage("Deleted one saved highlight.");
          }}
        />
      </div>
    </div>
  );
}
