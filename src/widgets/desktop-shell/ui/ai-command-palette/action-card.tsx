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
        "rounded-2xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        isSelected
          ? "border-accent/45 bg-accent/14 text-foreground shadow-[0_0_0_1px_rgba(10,132,255,0.22)_inset,0_14px_36px_rgba(10,132,255,0.2)] ring-2 ring-accent/20"
          : "border-white/8 bg-white/4 text-foreground/88",
        isDisabled ? "cursor-not-allowed opacity-45" : "hover:border-white/16 hover:bg-white/7",
      )}
      aria-pressed={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-[-0.01em]">{action.label}</div>
          <div className="mt-1 text-xs leading-5 text-muted/80">{action.description}</div>
        </div>

        {action.shortcutHint ? (
          <kbd className="shrink-0 rounded-lg border border-white/10 bg-white/6 px-1.5 py-0.5 text-[10px] font-medium text-muted/70">
            {action.shortcutHint}
          </kbd>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
        <span className="rounded-full border border-white/8 bg-black/10 px-2 py-1 text-muted/75">
          {getOutputModeLabel(action.outputMode)}
        </span>
        {isDisabled ? <span className="text-amber-300/90">Unavailable</span> : null}
      </div>

      {isDisabled && disabledReason ? (
        <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{disabledReason}</p>
      ) : null}
    </button>
  );
}
