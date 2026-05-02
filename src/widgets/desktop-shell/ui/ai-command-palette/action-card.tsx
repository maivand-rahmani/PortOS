import type { AiActionDefinition } from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

import { getOutputModeLabel } from "./ai-command-palette.helpers";

type ActionCardProps = {
  action: AiActionDefinition;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  onSelect: () => void;
};

export function ActionCard({
  action,
  isSelected,
  isDisabled,
  disabledReason,
  onSelect,
}: ActionCardProps) {
  return (
    <button
      data-ai-action-id={action.id}
      type="button"
      disabled={isDisabled}
      onClick={onSelect}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        isSelected
          ? "border-accent/50 bg-accent/10 text-foreground ring-1 ring-accent/20"
          : "border-border bg-surface/60 text-foreground/85",
        isDisabled ? "cursor-not-allowed opacity-40" : "hover:border-border/80 hover:bg-surface",
      )}
      aria-pressed={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[-0.01em]">{action.label}</div>
          <div className="mt-1 text-[11px] leading-5 text-muted">{action.description}</div>
        </div>

        {action.shortcutHint ? (
          <kbd className="shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
            {action.shortcutHint}
          </kbd>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-[10px]">
        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted">
          {getOutputModeLabel(action.outputMode)}
        </span>
        {isDisabled ? <span className="text-amber-500">Unavailable</span> : null}
      </div>

      {isDisabled && disabledReason ? (
        <p className="mt-1.5 text-[10px] leading-4 text-muted">{disabledReason}</p>
      ) : null}
    </button>
  );
}
