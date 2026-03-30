type BlogReaderHeaderProps = {
  processId: string;
  query: string;
  onQueryChange: (value: string) => void;
  postCount: number;
  queuedCount: number;
  completedCount: number;
  statusMessage: string;
};

export function BlogReaderHeader({
  processId,
  query,
  onQueryChange,
  postCount,
  queuedCount,
  completedCount,
  statusMessage,
}: BlogReaderHeaderProps) {
  return (
    <header className="rounded-[28px] bg-white/85 p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.26em] text-teal-700/60">Blog Reader</p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-semibold text-slate-950">
            Read, queue, and route useful ideas through the OS.
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-teal-50 px-3 py-1">Session {processId.slice(0, 6)}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{postCount} posts</span>
            <span className="rounded-full bg-amber-50 px-3 py-1">{queuedCount} queued</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1">{completedCount} finished</span>
          </div>
        </div>

        <label className="flex min-h-[48px] w-full items-center rounded-full border border-teal-200 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-teal-400/60 xl:max-w-80">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search posts, excerpts, body, or tags"
            className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <p className="mt-3 text-sm text-teal-950/65">{statusMessage}</p>
    </header>
  );
}
