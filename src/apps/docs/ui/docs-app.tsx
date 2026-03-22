"use client";

import { useEffect, useState } from "react";

import type { AppComponentProps } from "@/entities/app";

type Section = { title: string; body: string };

export function DocsApp({ processId }: AppComponentProps) {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDocs() {
      const response = await fetch("/api/docs");
      const payload = (await response.json()) as { sections: Section[] };

      if (!cancelled) {
        setSections(payload.sections);
      }
    }

    void loadDocs();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="docs-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/80 p-4 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700/60">Docs</p>
        <p className="mt-2 text-sm text-slate-900/60">Documentation process {processId.slice(0, 6)}</p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto rounded-[24px] bg-white/72 p-5 shadow-panel">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[20px] border border-slate-200 bg-white/86 p-4">
            <h2 className="font-display text-2xl font-semibold text-slate-950">{section.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{section.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
