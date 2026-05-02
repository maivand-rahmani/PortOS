import type { AiActionDefinition, AiServiceContext, AiServiceStatus } from "@/processes";

import { IdleState, LoadingState, PreviewContent } from "./ai-command-palette.helpers";

type PreviewBodyProps = {
  aiStatus: AiServiceStatus;
  aiError: string | null;
  previewContent: string;
  context: AiServiceContext;
  selectedAction: AiActionDefinition | null;
};

export function PreviewBody({
  aiStatus,
  aiError,
  previewContent,
  context,
  selectedAction,
}: PreviewBodyProps) {
  if (aiStatus === "loading") {
    return <LoadingState label="Contacting the model..." />;
  }

  if (aiStatus === "error" && aiError) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-foreground">
          {aiError}
        </div>
        {previewContent ? <PreviewContent content={previewContent} /> : null}
      </div>
    );
  }

  if (previewContent) {
    return <PreviewContent content={previewContent} />;
  }

  return <IdleState context={context} selectedAction={selectedAction} />;
}

export function ResponseSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-[260px] rounded-2xl border border-border bg-surface p-5 sm:p-6">
      {children}
    </div>
  );
}
