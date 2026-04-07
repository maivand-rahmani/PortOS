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
        <div className="rounded-2xl border border-red-400/18 bg-red-500/10 px-4 py-3 text-sm text-red-100">
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
    <div className="w-full min-h-[260px] rounded-[28px] border border-white/8 bg-white/6 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.14)] sm:p-6">
      {children}
    </div>
  );
}
