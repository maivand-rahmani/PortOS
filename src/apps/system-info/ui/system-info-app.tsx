"use client";

import type { AppComponentProps } from "@/entities/app";
import { getRuntimeSnapshot, terminateProcessById } from "@/shared/lib";
import { useOSStore } from "@/processes";

export function SystemInfoApp({ processId }: AppComponentProps) {
  const processes = useOSStore((state) => state.processes);
  const windows = useOSStore((state) => state.windows);
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const apps = useOSStore((state) => state.apps);
  const snapshot = getRuntimeSnapshot();

  return (
    <div className="system-info-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[24px] bg-white/75 p-4 shadow-panel"><p className="text-xs uppercase tracking-[0.22em] text-blue-700/60">Apps</p><p className="mt-3 text-3xl font-semibold text-blue-950">{apps.length}</p></article>
        <article className="rounded-[24px] bg-white/75 p-4 shadow-panel"><p className="text-xs uppercase tracking-[0.22em] text-blue-700/60">Processes</p><p className="mt-3 text-3xl font-semibold text-blue-950">{processes.length}</p></article>
        <article className="rounded-[24px] bg-white/75 p-4 shadow-panel"><p className="text-xs uppercase tracking-[0.22em] text-blue-700/60">Windows</p><p className="mt-3 text-3xl font-semibold text-blue-950">{windows.length}</p></article>
        <article className="rounded-[24px] bg-white/75 p-4 shadow-panel"><p className="text-xs uppercase tracking-[0.22em] text-blue-700/60">Active</p><p className="mt-3 truncate text-sm font-semibold text-blue-950">{activeWindowId ?? "none"}</p></article>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <section className="min-h-0 rounded-[24px] bg-white/75 p-4 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-blue-950">Processes</h2>
            <p className="text-xs uppercase tracking-[0.22em] text-blue-700/55">Inspector {processId.slice(0, 6)}</p>
          </div>
          <div className="mt-4 space-y-3 overflow-auto">
            {processes.map((process) => (
              <article key={process.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-blue-100 bg-white/80 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-blue-950">{process.name}</p>
                  <p className="text-xs text-blue-900/60">{process.id.slice(0, 8)} · {process.status}</p>
                </div>
                <button
                  type="button"
                  onClick={() => terminateProcessById(process.id)}
                  className="cursor-pointer rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white"
                >
                  Kill
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] bg-white/75 p-4 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-blue-950">Snapshot</h2>
          <pre className="mt-4 overflow-auto rounded-[18px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">{JSON.stringify(snapshot, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
}
