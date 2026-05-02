import { LoaderCircle } from "lucide-react";

import {
  canApplyAiResult,
  canExecuteAiAction,
  describeContext,
  getAiActionDisabledReason,
  hasAiFileContent,
  type AiActionDefinition,
  type AiServiceContext,
  type AiServiceResult,
  type AiServiceStatus,
} from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

export function StatusChip({ status }: { status: AiServiceStatus }) {
  const { label, className } = getStatusMeta(status);

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[132px] items-center justify-center text-sm text-muted">
      <span className="inline-flex items-center gap-2">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

export function IdleState({
  context,
  selectedAction,
}: {
  context: AiServiceContext;
  selectedAction: AiActionDefinition | null;
}) {
  const hasFileContext = hasAiFileContent(context);
  const hasSelection = Boolean(context.selection?.text.trim());

  return (
    <div className="flex h-full min-h-[132px] flex-col justify-center text-sm text-muted">
      <p className="text-foreground">
        {selectedAction ? `${selectedAction.label} is ready.` : "Choose an AI action to begin."}
      </p>
      <p className="mt-2 leading-6">
        {hasSelection
          ? "AI will use the selected text from the active app and show the answer here."
          : hasFileContext
          ? "PortOS will use the current file as context and stream the result here in real time."
          : "Generate works anywhere. For the other actions, PortOS will use the current app context and stream the answer here."}
      </p>
    </div>
  );
}

export function PreviewContent({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap break-words font-sans text-[14px] leading-7 text-foreground">
      {content}
    </pre>
  );
}

export function getContextSummary(context: AiServiceContext): string {
  if (context.file) {
    return describeContext(context);
  }

  if (context.sourceAppId === "desktop-shell") {
    return "Desktop context";
  }

  return `${humanizeId(context.sourceAppId)} context`;
}

export function getOutputModeLabel(outputMode: AiActionDefinition["outputMode"]): string {
  switch (outputMode) {
    case "replace":
      return "Replace file";
    case "new-file":
      return "New file";
    default:
      return "Inline preview";
  }
}

export function getOutputModeDescription(outputMode: AiActionDefinition["outputMode"]): string {
  switch (outputMode) {
    case "replace":
      return "Applying the result will route the replacement back through the active app when supported.";
    case "new-file":
      return "Applying the result will create a new file in the PortOS filesystem.";
    default:
      return "This action stays in the preview and does not write to the filesystem.";
  }
}

export function isApplyableResult(result: AiServiceResult, hasFileContext: boolean): boolean {
  return hasFileContext || result.outputMode === "new-file";
}

export function getApplyLabel(result: AiServiceResult): string {
  switch (result.outputMode) {
    case "replace":
      return "Apply Replace";
    case "new-file":
      return "Create File";
    default:
      return "Apply";
  }
}

export function canRunPaletteAction(action: AiActionDefinition, context: AiServiceContext): boolean {
  return canExecuteAiAction(action, context);
}

export function getPaletteActionDisabledReason(
  action: AiActionDefinition,
  context: AiServiceContext,
): string | null {
  return getAiActionDisabledReason(action, context);
}

export function canApplyPaletteResult(result: AiServiceResult, context: AiServiceContext): boolean {
  return canApplyAiResult(result, context);
}

function humanizeId(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusMeta(status: AiServiceStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "loading":
      return {
        label: "Loading",
        className: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-300",
      };
    case "streaming":
      return {
        label: "Streaming",
        className: "border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-300",
      };
    case "done":
      return {
        label: "Ready",
        className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
      };
    case "error":
      return {
        label: "Error",
        className: "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300",
      };
    default:
      return {
        label: "Idle",
        className: "border-border bg-surface text-muted",
      };
  }
}
