"use client";

import { useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import type { BlogPost } from "@/shared/lib/app-logic";

export function BlogApp({ processId }: AppComponentProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      const response = await fetch("/api/blog");
      const payload = (await response.json()) as { posts: BlogPost[] };

      if (!cancelled) {
        setPosts(payload.posts);
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
        <p className="text-[11px] uppercase tracking-[0.24em] text-violet-700/60">Blog</p>
        <p className="mt-2 text-sm text-violet-950/60">Reader session {processId.slice(0, 6)}</p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto">
        {posts.map((post) => (
          <article key={post.id} className="rounded-[24px] bg-white/80 p-5 shadow-panel">
            <p className="text-xs uppercase tracking-[0.22em] text-violet-700/55">{post.publishedAt}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-violet-950">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-violet-950/70">{post.excerpt}</p>
            <p className="mt-4 text-sm leading-7 text-violet-950/78">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
