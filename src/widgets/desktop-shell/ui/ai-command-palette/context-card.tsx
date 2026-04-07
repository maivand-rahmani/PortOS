import type { AiServiceContext } from "@/processes";

type ContextCardProps = {
  context: AiServiceContext;
  contextSummary: string;
  selectionPreview: string | null;
};

export function ContextCard({ context, contextSummary, selectionPreview }: ContextCardProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/6 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/55">
        Active Context
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{contextSummary}</p>

      {context.file?.path ? (
        <p className="mt-2 break-words text-xs leading-5 text-muted/72">{context.file.path}</p>
      ) : null}

      {selectionPreview ? (
        <div className="mt-3 rounded-2xl border border-white/8 bg-black/10 px-3 py-2 text-xs leading-5 text-muted/82">
          &ldquo;{selectionPreview}&rdquo;
        </div>
      ) : null}
    </div>
  );
}
