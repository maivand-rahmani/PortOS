"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles, X } from "lucide-react";

import {
  getAvailableActions,
  type AiActionDefinition,
  type AiActionId,
  type AiServiceContext,
  type AiServiceResult,
  type AiServiceStatus,
} from "@/processes";
import { cn } from "@/shared/lib/cn/cn";

import {
  canApplyPaletteResult,
  canRunPaletteAction,
  getApplyLabel,
  getContextSummary,
  getOutputModeDescription,
  getOutputModeLabel,
  getPaletteActionDisabledReason,
  StatusChip,
} from "./ai-command-palette.helpers";
import { ContextCard } from "./context-card";
import { ActionCard } from "./action-card";
import { moveSelectedAction } from "../../model/move-selected-action";
import { MessageList } from "./message-list";
import { AiMessage } from "@/processes";

type PanelMetrics = {
  left: number | string;
  top: number;
  width: number;
  height: number;
};

type AiCommandPalettePanelProps = {
  context: AiServiceContext;
  aiStatus: AiServiceStatus;
  aiStreamContent: string;
  aiLastResult: AiServiceResult | null;
  aiError: string | null;
  aiMessages: AiMessage[];
  aiStartNewSession: () => void;
  aiClosePalette: () => void;
  aiExecuteAction: (actionId: AiActionId, userPrompt?: string) => Promise<void>;
  aiApplyResult: (mode?: "replace" | "new-file") => Promise<void>;
  aiCancelRequest: () => void;
  shouldReduceMotion: boolean;
  panelMetrics: PanelMetrics;
};

export function AiCommandPalettePanel({
  context,
  aiStatus,
  aiStreamContent,
  aiLastResult,
  aiError,
  aiMessages,
  aiStartNewSession,
  aiClosePalette,
  aiExecuteAction,
  aiApplyResult,
  aiCancelRequest,
  shouldReduceMotion,
  panelMetrics,
}: AiCommandPalettePanelProps) {
  const [selectedActionId, setSelectedActionId] = useState<AiActionId | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const actionGridRef = useRef<HTMLDivElement>(null);
  const availableActions = useMemo(() => getAvailableActions(context), [context]);
  const contextSummary = useMemo(() => getContextSummary(context), [context]);
  const selectionPreview = useMemo(() => {
    const text = context.selection?.text.trim();

    if (!text) {
      return null;
    }

    return text.length > 180 ? `${text.slice(0, 180)}...` : text;
  }, [context.selection?.text]);
  const isBusy = aiStatus === "loading" || aiStatus === "streaming";

  const isActionDisabled = useCallback(
    (action: AiActionDefinition) => !canRunPaletteAction(action, context),
    [context],
  );

  const selectedAction = useMemo(() => {
    const current = availableActions.find((action) => action.id === selectedActionId) ?? null;

    if (current && !isActionDisabled(current)) {
      return current;
    }

    return availableActions.find((action) => !isActionDisabled(action)) ?? availableActions[0] ?? null;
  }, [availableActions, isActionDisabled, selectedActionId]);

  const enabledActions = useMemo(
    () => availableActions.filter((action) => !isActionDisabled(action)),
    [availableActions, isActionDisabled],
  );
  const canExecute = selectedAction !== null && !isBusy && !isActionDisabled(selectedAction);
  const canApply = aiLastResult !== null && canApplyPaletteResult(aiLastResult, context);
  const applyLabel = aiLastResult ? getApplyLabel(aiLastResult) : "Apply";
  const composerMessage = selectedAction
    ? isActionDisabled(selectedAction)
      ? getPaletteActionDisabledReason(selectedAction, context) ?? "This action is unavailable right now."
      : `${selectedAction.description}. ${getOutputModeDescription(selectedAction.outputMode)}`
    : "Select an AI action to begin.";

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!actionGridRef.current || !selectedAction) {
      return;
    }

    const selectedButton = actionGridRef.current.querySelector<HTMLButtonElement>(
      `[data-ai-action-id="${selectedAction.id}"]`,
    );

    selectedButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedAction]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      aiClosePalette();
    };

    window.addEventListener("pointerdown", handlePointerDown, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    };
  }, [aiClosePalette]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedAction || isBusy || isActionDisabled(selectedAction)) {
        return;
      }

      void aiExecuteAction(selectedAction.id, userPrompt.trim() || undefined);
      setUserPrompt("");
    },
    [aiExecuteAction, isActionDisabled, isBusy, selectedAction, userPrompt],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        aiClosePalette();
        return;
      }

      if ((event.metaKey || event.ctrlKey || event.altKey) && event.key !== "Enter") {
        return;
      }

      const shortcutAction = availableActions.find(
        (action) => action.shortcutHint === event.key && !isActionDisabled(action),
      );

      if (shortcutAction) {
        event.preventDefault();
        setSelectedActionId(shortcutAction.id);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveSelectedAction(enabledActions, selectedAction?.id ?? null, 1, setSelectedActionId);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        moveSelectedAction(enabledActions, selectedAction?.id ?? null, -1, setSelectedActionId);
        return;
      }

      if (event.key === "Enter" && document.activeElement !== inputRef.current) {
        event.preventDefault();

        if (!selectedAction || isBusy || isActionDisabled(selectedAction)) {
          return;
        }

        void aiExecuteAction(selectedAction.id, userPrompt.trim() || undefined);
      }
    },
    [
      aiClosePalette,
      aiExecuteAction,
      availableActions,
      enabledActions,
      isActionDisabled,
      isBusy,
      selectedAction,
      userPrompt,
    ],
  );

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none fixed inset-0 z-[9800]"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="AI command palette"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.975 }}
        transition={{ type: "spring", stiffness: 500, damping: 36 }}
        onKeyDown={handleKeyDown}
        className="pointer-events-auto absolute -translate-x-1/2 overflow-hidden rounded-[22px] bg-window border border-border shadow-window backdrop-blur-2xl"
        style={{
          left: panelMetrics.left,
          top: panelMetrics.top,
          width: panelMetrics.width,
          height: panelMetrics.height,
          maxHeight: panelMetrics.height,
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-accent text-white shadow-sm">
                <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                  AI Assistant
                </p>
                <p className="truncate text-[11px] text-muted">{contextSummary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusChip status={aiStatus} />

              {aiMessages.length > 0 && (
                <button
                  type="button"
                  onClick={aiStartNewSession}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-surface px-3 text-[11px] font-medium text-muted transition-colors hover:bg-surface/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                  aria-label="Start new conversation"
                >
                  New Chat
                </button>
              )}

              <button
                type="button"
                onClick={aiClosePalette}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                aria-label="Close AI command palette"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="order-2 min-h-0 border-t border-border bg-surface/40 lg:order-1 lg:border-r lg:border-t-0">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-border p-4">
                  <ContextCard
                    context={context}
                    contextSummary={contextSummary}
                    selectionPreview={selectionPreview}
                  />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                  <div ref={actionGridRef} className="grid gap-2">
                    {availableActions.map((action) => {
                      const isSelected = action.id === selectedAction?.id;
                      const isDisabled = isActionDisabled(action);

                      return (
                        <ActionCard
                          key={action.id}
                          action={action}
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                          disabledReason={getPaletteActionDisabledReason(action, context)}
                          onSelect={() => setSelectedActionId(action.id)}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                    Active Action
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {selectedAction ? selectedAction.label : "Choose an action"}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{composerMessage}</p>
                </div>
              </div>
            </aside>

            <section className="order-1 flex min-h-0 flex-col bg-background/60 lg:order-2">
              <div className="border-b border-border px-5 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-semibold text-foreground">
                      {selectedAction ? selectedAction.label : "AI Response"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedAction ? (
                      <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
                        {getOutputModeLabel(selectedAction.outputMode)}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
                      {aiMessages.length + (aiStatus === "streaming" ? 1 : 0)} turn
                      {aiMessages.length + (aiStatus === "streaming" ? 1 : 0) === 1 ? "" : "s"}
                    </span>
                    {aiLastResult?.suggestedPath ? (
                      <span className="max-w-[16rem] truncate rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
                        {aiLastResult.suggestedPath}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 px-5 py-4">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-[72ch]">
                  <MessageList
                    messages={aiMessages}
                    streamingContent={aiStatus === "streaming" ? aiStreamContent : ""}
                  />
                </div>
              </div>

              <div className="border-t border-border bg-surface/30 px-4 py-3">
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                  <div className="flex items-center gap-2">
                    <label className="flex min-h-11 flex-1 items-center gap-2.5 rounded-[16px] border border-border bg-background px-4 transition-colors focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10">
                      <Sparkles className="h-4 w-4 shrink-0 text-muted" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={userPrompt}
                        onChange={(event) => setUserPrompt(event.target.value)}
                        placeholder={
                          selectedAction
                            ? `Add a prompt for ${selectedAction.label.toLowerCase()}...`
                            : "Add an optional instruction..."
                        }
                        className="min-h-11 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted outline-none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={!canExecute}
                      className={cn(
                        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                        canExecute
                          ? "bg-foreground text-background hover:bg-foreground/85"
                          : "cursor-not-allowed bg-surface text-muted border border-border",
                      )}
                      aria-label="Send"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <p className="max-w-[42rem] text-[11px] leading-5 text-muted">{composerMessage}</p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {isBusy ? (
                        <button
                          type="button"
                          onClick={aiCancelRequest}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        >
                          Cancel
                        </button>
                      ) : null}

                      {canApply ? (
                        <button
                          type="button"
                          onClick={() => void aiApplyResult()}
                          className="inline-flex min-h-8 items-center justify-center rounded-lg bg-accent px-3 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        >
                          {applyLabel}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={aiClosePalette}
                        className="inline-flex min-h-8 items-center justify-center rounded-lg border border-border bg-surface px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                      >
                        {canApply ? "Dismiss" : "Close"}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-muted">
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1 py-px font-medium">1-6</kbd> pick
                  </span>
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1 py-px font-medium">arrows</kbd> move
                  </span>
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1 py-px font-medium">enter</kbd> run
                  </span>
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1 py-px font-medium">esc</kbd> dismiss
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
