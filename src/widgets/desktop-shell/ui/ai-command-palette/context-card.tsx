import type { AiServiceContext } from "@/processes";

type ContextCardProps = {
  context: AiServiceContext;
  contextSummary: string;
  selectionPreview: string | null;
};

export function ContextCard({ context, contextSummary, selectionPreview }: ContextCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
        Active Context
      </p>
      <p className="mt-1.5 text-[13px] font-semibold text-foreground">{contextSummary}</p>

      {context.file?.path ? (
        <p className="mt-1.5 break-words text-[11px] leading-5 text-muted">{context.file.path}</p>
      ) : null}

      {selectionPreview ? (
        <div className="mt-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] leading-5 text-muted">
          &ldquo;{selectionPreview}&rdquo;
        </div>
      ) : null}
    </div>
  );
}
