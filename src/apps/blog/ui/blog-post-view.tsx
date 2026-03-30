import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { BlogPost } from "@/shared/lib/app-logic";

type BlogPostViewProps = {
  post: BlogPost | null;
  isQueued: boolean;
  isCompleted: boolean;
  highlightDraft: string;
  highlightCount: number;
  relatedPortfolioLabel: string | null;
  onHighlightDraftChange: (value: string) => void;
  onToggleQueue: () => void;
  onToggleComplete: () => void;
  onSaveExcerpt: () => void;
  onSaveNote: () => void;
  onSendToNotes: () => void;
  onAskAgent: () => void;
  onOpenPortfolio: (() => void) | null;
};

const actionButtonClassName =
  "min-h-[44px] cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60";

export function BlogPostView({
  post,
  isQueued,
  isCompleted,
  highlightDraft,
  highlightCount,
  relatedPortfolioLabel,
  onHighlightDraftChange,
  onToggleQueue,
  onToggleComplete,
  onSaveExcerpt,
  onSaveNote,
  onSendToNotes,
  onAskAgent,
  onOpenPortfolio,
}: BlogPostViewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <article className="min-h-0 overflow-auto rounded-[28px] bg-white/84 p-5 shadow-panel">
      <AnimatePresence mode="wait" initial={false}>
        {post ? (
          <motion.section
            key={post.id}
            initial={reduceMotion ? undefined : { opacity: 0, x: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-teal-700/60">
              <span>{post.publishedAt}</span>
              {isQueued ? <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] text-amber-700">Queued</span> : null}
              {isCompleted ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] text-emerald-700">Finished</span> : null}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-600">{highlightCount} highlights</span>
            </div>

            <h3 className="mt-3 font-display text-3xl font-semibold text-slate-950 xl:text-4xl">{post.title}</h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-5 text-base leading-8 text-slate-700">{post.excerpt}</p>
            <p className="mt-5 text-sm leading-8 text-slate-700">{post.body}</p>

            <div className="mt-6 rounded-[24px] border border-teal-100 bg-teal-50/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-teal-700/65">Reading Actions</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onToggleQueue}
                  className={`${actionButtonClassName} ${
                    isQueued
                      ? "border-amber-200 bg-amber-100 text-amber-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:text-amber-800"
                  }`}
                >
                  {isQueued ? "Remove from queue" : "Queue for later"}
                </button>
                <button
                  type="button"
                  onClick={onToggleComplete}
                  className={`${actionButtonClassName} ${
                    isCompleted
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-800"
                  }`}
                >
                  {isCompleted ? "Mark as unfinished" : "Mark as finished"}
                </button>
                <button
                  type="button"
                  onClick={onSaveExcerpt}
                  className={`${actionButtonClassName} border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800`}
                >
                  Save excerpt highlight
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Highlight Composer</p>
              <textarea
                value={highlightDraft}
                onChange={(event) => onHighlightDraftChange(event.target.value)}
                placeholder="Capture a takeaway, disagreement, follow-up question, or implementation idea."
                className="mt-3 min-h-28 w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:ring-2 focus:ring-teal-400/60"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onSaveNote}
                  className={`${actionButtonClassName} border-teal-200 bg-teal-600 text-white hover:bg-teal-700`}
                >
                  Save reading note
                </button>
                <button
                  type="button"
                  onClick={onSendToNotes}
                  className={`${actionButtonClassName} border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800`}
                >
                  Send brief to Notes
                </button>
                <button
                  type="button"
                  onClick={onAskAgent}
                  className={`${actionButtonClassName} border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800`}
                >
                  Ask AI about this post
                </button>
                {onOpenPortfolio ? (
                  <button
                    type="button"
                    onClick={onOpenPortfolio}
                    className={`${actionButtonClassName} border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800`}
                  >
                    Open {relatedPortfolioLabel}
                  </button>
                ) : null}
              </div>
            </div>
          </motion.section>
        ) : (
          <p className="text-sm text-slate-500">No posts match your search.</p>
        )}
      </AnimatePresence>
    </article>
  );
}
