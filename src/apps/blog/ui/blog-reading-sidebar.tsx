import type { BlogPost } from "@/shared/lib/app-data/app-logic";

import type { BlogHighlight } from "../model/blog-reader-storage";

type BlogReadingSidebarProps = {
  queuedPosts: BlogPost[];
  activePostId: string | null;
  highlights: BlogHighlight[];
  completedCount: number;
  totalCount: number;
  onSelectPost: (postId: string) => void;
  onRemoveFromQueue: (postId: string) => void;
  onRemoveHighlight: (highlightId: string) => void;
};

export function BlogReadingSidebar({
  queuedPosts,
  activePostId,
  highlights,
  completedCount,
  totalCount,
  onSelectPost,
  onRemoveFromQueue,
  onRemoveHighlight,
}: BlogReadingSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-[28px] bg-white/76 p-4 shadow-panel">
      <section className="rounded-[24px] border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-teal-700/65">Reading Workflow</p>
        <p className="mt-2 text-2xl font-display font-semibold text-slate-950">
          {completedCount}/{totalCount || 1}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Finished posts stay available for handoffs while queued posts remain ready for the next reading pass.
        </p>
      </section>

      <section className="min-h-0 rounded-[24px] border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Queue</p>
            <p className="mt-1 font-display text-xl font-semibold text-slate-950">Saved for follow-up</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            {queuedPosts.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {queuedPosts.length > 0 ? (
            queuedPosts.map((post) => (
              <div key={post.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                <button
                  type="button"
                  onClick={() => onSelectPost(post.id)}
                  className={`w-full cursor-pointer text-left ${post.id === activePostId ? "text-teal-800" : "text-slate-900"}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{post.publishedAt}</p>
                  <p className="mt-1 text-sm font-semibold">{post.title}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFromQueue(post.id)}
                  className="mt-3 min-h-[44px] cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-rose-200 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
                >
                  Remove from queue
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-slate-500">Queue a post to keep it visible here while you move through the rest of the reader.</p>
          )}
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto rounded-[24px] border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Highlights</p>
            <p className="mt-1 font-display text-xl font-semibold text-slate-950">Active post notes</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            {highlights.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {highlights.length > 0 ? (
            highlights.map((highlight) => (
              <article key={highlight.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {new Date(highlight.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {highlight.quote ? <p className="mt-2 text-sm leading-6 text-slate-700">&ldquo;{highlight.quote}&rdquo;</p> : null}
                {highlight.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.note}</p> : null}
                <button
                  type="button"
                  onClick={() => onRemoveHighlight(highlight.id)}
                  className="mt-3 min-h-[44px] cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-rose-200 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60"
                >
                  Delete highlight
                </button>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              Save the excerpt or your own reading notes to turn the current post into something reusable across the OS.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}
