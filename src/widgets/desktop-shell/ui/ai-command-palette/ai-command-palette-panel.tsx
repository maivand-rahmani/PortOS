"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, X } from "lucide-react";

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
      transition={{ duration: 0.16 }}
      className="pointer-events-none fixed inset-0 z-[9800]"
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-label="AI command palette"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        onKeyDown={handleKeyDown}
        className="pointer-events-auto absolute -translate-x-1/2 overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(30,33,44,0.9),rgba(18,20,28,0.94))] shadow-[0_40px_120px_rgba(15,23,42,0.42),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-3xl"
        style={{
          left: panelMetrics.left,
          top: panelMetrics.top,
          width: panelMetrics.width,
          height: panelMetrics.height,
          maxHeight: panelMetrics.height,
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a7a] via-[#ff6b57] to-[#ff4d73] text-white shadow-[0_10px_28px_rgba(255,107,87,0.35)]">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted/65">
                      System AI
                    </p>
                    <h2 className="truncate text-[18px] font-semibold tracking-[-0.02em] text-foreground">
                      Command Palette
                    </h2>
                  </div>
                </div>
                <p className="mt-3 max-w-[38rem] text-sm text-muted/85">{contextSummary}</p>
              </div>

              <div className="flex items-center gap-2">
                <StatusChip status={aiStatus} />
                
                {aiMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={aiStartNewSession}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-[12px] font-medium text-muted/75 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    aria-label="Start new conversation"
                  >
                    New Chat
                  </button>
                )}

                <button
                  type="button"
                  onClick={aiClosePalette}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted/75 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                  aria-label="Close AI command palette"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="order-2 min-h-0 border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.12))] lg:order-1 lg:border-r lg:border-t-0">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-white/8 p-4">
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

                <div className="border-t border-white/8 px-4 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/55">
                    Active Action
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedAction ? selectedAction.label : "Choose an action"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted/75">{composerMessage}</p>
                </div>
              </div>
            </aside>

            <section className="order-1 min-h-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.08))] lg:order-2">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-white/8 px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/55">
                        Conversation
                      </p>
                      <h3 className="mt-1 truncate text-base font-semibold text-foreground">
                        {selectedAction ? selectedAction.label : "AI response"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedAction ? (
                        <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-muted/78">
                          {getOutputModeLabel(selectedAction.outputMode)}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-muted/78">
                        {aiMessages.length + (aiStatus === "streaming" ? 1 : 0)} turn{aiMessages.length + (aiStatus === "streaming" ? 1 : 0) === 1 ? "" : "s"}
                      </span>
                      {aiLastResult?.suggestedPath ? (
                        <span className="max-w-[18rem] truncate rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-muted/78">
                          {aiLastResult.suggestedPath}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 px-6 py-5">
                  <div className="mx-auto flex h-full min-h-0 w-full max-w-[74ch]">
                    <MessageList 
                      messages={aiMessages} 
                      streamingContent={aiStatus === "streaming" ? aiStreamContent : ""} 
                    />
                  </div>
                </div>

                <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.16))] px-5 py-4">
                  <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3 md:flex-row">
                      <label className="flex min-h-12 flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 transition-colors focus-within:border-accent/35 focus-within:bg-white/8">
                        <Wand2 className="h-4 w-4 shrink-0 text-muted/60" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={userPrompt}
                          onChange={(event) => setUserPrompt(event.target.value)}
                          placeholder={
                            selectedAction
                              ? `Add a direction for ${selectedAction.label.toLowerCase()}...`
                              : "Add an optional instruction..."
                          }
                          className="min-h-12 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted/45 outline-none"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={!canExecute}
                        className={cn(
                          "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 md:min-w-[144px]",
                          canExecute
                            ? "bg-accent text-white shadow-[0_16px_36px_rgba(10,132,255,0.32)] hover:bg-[#238dff]"
                            : "cursor-not-allowed bg-white/8 text-muted/55",
                        )}
                      >
                          {isBusy ? "Running" : "Send"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <p className="max-w-[46rem] text-xs leading-5 text-muted/75">{composerMessage}</p>

                      <div className="flex flex-wrap items-center gap-2">
                        {isBusy ? (
                          <button
                            type="button"
                            onClick={aiCancelRequest}
                            className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/12 bg-white/6 px-3 text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                          >
                            Cancel
                          </button>
                        ) : null}

                        {canApply ? (
                          <button
                            type="button"
                            onClick={() => void aiApplyResult()}
                            className="inline-flex min-h-9 items-center justify-center rounded-full bg-accent px-3.5 text-white shadow-[0_14px_32px_rgba(10,132,255,0.28)] transition-colors hover:bg-[#238dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                          >
                            {applyLabel}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={aiClosePalette}
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/12 bg-white/6 px-3 text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        >
                          {canApply ? "Dismiss" : "Close"}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted/65">
                    <span>
                      <kbd className="rounded border border-white/10 bg-white/6 px-1 py-px">1-6</kbd> pick action
                    </span>
                    <span>
                      <kbd className="rounded border border-white/10 bg-white/6 px-1 py-px">arrows</kbd> move
                    </span>
                    <span>
                      <kbd className="rounded border border-white/10 bg-white/6 px-1 py-px">enter</kbd> run
                    </span>
                    <span>
                      <kbd className="rounded border border-white/10 bg-white/6 px-1 py-px">esc</kbd> dismiss
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
