"use client";

import { useEffect, useMemo, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import type { BlogPost } from "@/shared/lib/app-logic";

export function BlogApp({ processId }: AppComponentProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.excerpt, post.body, ...post.tags].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [posts, query]);

  const activePost = filteredPosts.find((post) => post.id === activePostId) ?? filteredPosts[0] ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      const response = await fetch("/api/blog");
      const payload = (await response.json()) as { posts: BlogPost[] };

      if (!cancelled) {
        setPosts(payload.posts);
        setActivePostId(payload.posts[0]?.id ?? null);
      }
    }

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="blog-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/80 p-4 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-teal-700/60">Blog</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-teal-950/60">Reader session {processId.slice(0, 6)}</p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts"
            className="w-full rounded-full border border-teal-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-400/60 lg:max-w-72"
          />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto rounded-[24px] bg-white/80 p-4 shadow-panel">
          {filteredPosts.length > 0 ? (
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const isActive = post.id === activePost?.id;

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setActivePostId(post.id)}
                    className={`w-full cursor-pointer rounded-[20px] border px-4 py-4 text-left transition duration-200 ${
                      isActive
                        ? "border-teal-500 bg-teal-50 text-teal-950"
                        : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/60"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{post.publishedAt}</p>
                    <p className="mt-2 font-display text-xl font-semibold text-slate-950">{post.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No posts found.</p>
          )}
        </aside>
        <article className="min-h-0 overflow-auto rounded-[24px] bg-white/80 p-5 shadow-panel">
          {activePost ? (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-teal-700/55">{activePost.publishedAt}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">{activePost.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {activePost.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{activePost.excerpt}</p>
              <p className="mt-6 text-sm leading-8 text-slate-700">{activePost.body}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">No posts match your search.</p>
          )}
        </article>
      </div>
    </div>
  );
}
