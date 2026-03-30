import type { BlogPost } from "@/shared/lib/app-logic";

type BlogPostListProps = {
  posts: BlogPost[];
  activePostId: string | null;
  queuedPostIds: string[];
  completedPostIds: string[];
  onSelect: (postId: string) => void;
};

export function BlogPostList({ posts, activePostId, queuedPostIds, completedPostIds, onSelect }: BlogPostListProps) {
  return (
    <aside className="min-h-0 overflow-auto rounded-[28px] bg-white/82 p-4 shadow-panel">
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => {
            const isActive = post.id === activePostId;
            const isQueued = queuedPostIds.includes(post.id);
            const isCompleted = completedPostIds.includes(post.id);

            return (
              <button
                key={post.id}
                type="button"
                onClick={() => onSelect(post.id)}
                className={`w-full cursor-pointer rounded-[22px] border px-4 py-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
                  isActive
                    ? "border-teal-500 bg-teal-50 text-teal-950"
                    : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/60"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <span>{post.publishedAt}</span>
                  {isQueued ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-700">Queue</span> : null}
                  {isCompleted ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] text-emerald-700">Done</span> : null}
                </div>
                <p className="mt-2 font-display text-xl font-semibold text-slate-950">{post.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No posts match your search.</p>
      )}
    </aside>
  );
}
