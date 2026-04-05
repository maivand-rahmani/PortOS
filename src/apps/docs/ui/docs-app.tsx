"use client";

import { useEffect, useMemo, useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { slugifyDocsHeading } from "@/shared/lib";
import type { DocsDocument } from "@/shared/lib/app-data/docs";

type DocsResponse = { documents: DocsDocument[] };

export function DocsApp({ processId }: AppComponentProps) {
  const [documents, setDocuments] = useState<DocsDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) ?? documents[0] ?? null,
    [activeDocumentId, documents],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDocs() {
      const response = await fetch("/api/docs");
      const payload = (await response.json()) as DocsResponse;

      if (!cancelled) {
        setDocuments(payload.documents);
        setActiveDocumentId(payload.documents[0]?.id ?? null);
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
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto rounded-[24px] bg-white/76 p-4 shadow-panel">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700/55">Documents</p>
          <div className="mt-4 space-y-3">
            {documents.map((document) => {
              const isActive = document.id === activeDocument?.id;

              return (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setActiveDocumentId(document.id)}
                  className={`w-full cursor-pointer rounded-[20px] border px-4 py-4 text-left transition duration-200 ${
                    isActive
                      ? "border-teal-500 bg-teal-50 text-teal-950"
                      : "border-slate-200 bg-white/80 text-slate-900 hover:border-teal-200 hover:bg-teal-50/70"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{document.folder}</p>
                  <p className="mt-2 font-semibold">{document.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{document.summary}</p>
                </button>
              );
            })}
          </div>
        </aside>
        <section className="grid min-h-0 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-auto rounded-[24px] bg-white/76 p-4 shadow-panel">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-700/55">Contents</p>
            <div className="mt-4 space-y-2">
              {activeDocument?.headings.map((heading) => (
                <button
                  key={heading.id}
                  type="button"
                  onClick={() => {
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`block w-full cursor-pointer rounded-[16px] px-3 py-2 text-left text-sm text-slate-700 transition duration-200 hover:bg-teal-50 hover:text-teal-900 ${
                    heading.level > 1 ? "ml-3" : ""
                  }`}
                >
                  {heading.title}
                </button>
              ))}
            </div>
          </aside>
          <article className="min-h-0 overflow-auto rounded-[24px] bg-white/80 p-5 shadow-panel">
            {activeDocument ? (
              <>
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-700/70">{activeDocument.path}</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-slate-950">{activeDocument.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{activeDocument.summary}</p>
                </div>
                <div className="mt-6 space-y-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {activeDocument.content.split(/\n\n+/).map((block, index) => {
                    const headingMatch = block.match(/^(#{1,3})\s+(.+)(?:\n([\s\S]+))?$/);

                    if (headingMatch) {
                      const level = headingMatch[1].length;
                      const title = headingMatch[2].trim();
                      const HeadingTag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";

                      return (
                        <div key={`${title}-${index}`} className="space-y-3">
                          <HeadingTag
                            id={slugifyDocsHeading(title)}
                            className="font-display font-semibold text-slate-950"
                          >
                            {title}
                          </HeadingTag>
                          {headingMatch[3] ? <p>{headingMatch[3].trim()}</p> : null}
                        </div>
                      );
                    }

                    return <p key={`${block.slice(0, 24)}-${index}`}>{block}</p>;
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Loading documentation...</p>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}
