"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { getNodePath, useOSStore, getSystemShortcutBindings } from "@/processes";
import type { ShortcutBinding } from "@/processes";
import type { AppConfig } from "@/entities/app";
import {
  spotlightSearch,
  flattenResults,
  type SpotlightResult,
  type SpotlightResultGroup,
} from "../model/spotlight-search";

// ── Category icons (simple SVG inline) ──────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  const className = "h-4 w-4 shrink-0 text-muted/70";

  switch (category) {
    case "app":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className}>
          <rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.5" />
          <rect x="9" y="9" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "window":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className}>
          <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <line x1="1" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "file":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className}>
          <path d="M4 2h5l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "shortcut":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className}>
          <rect x="1" y="5" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <rect x="3" y="7.5" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
          <rect x="7" y="7.5" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
          <rect x="11" y="7.5" width="2" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      );
    case "action":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={className}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// ── App icon renderer ───────────────────────────────────────────────────────

function AppIconSmall({ app }: { app: AppConfig | undefined }) {
  if (!app) return null;

  const Icon = app.icon;

  return <Icon className="h-5 w-5 shrink-0" />;
}

// ── Shortcut binding renderer ───────────────────────────────────────────────────

function ShortcutBindingDisplay({ binding }: { binding: ShortcutBinding }) {
  if (binding.kind === "sequence") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-muted/50">
        {binding.steps.map((step, i) => (
          <React.Fragment key={i}>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans font-medium uppercase">{step === "space" ? "Space" : step}</kbd>
            {i < binding.steps.length - 1 && <span>then</span>}
          </React.Fragment>
        ))}
      </span>
    );
  }
  
  // combo
  const symbols: string[] = [];
  if (binding.modifiers.includes("ctrl")) symbols.push("⌃");
  if (binding.modifiers.includes("alt")) symbols.push("⌥");
  if (binding.modifiers.includes("shift")) symbols.push("⇧");
  if (binding.modifiers.includes("meta")) symbols.push("⌘");
  const keyLabel = binding.key.length === 1 ? binding.key.toUpperCase() : binding.key;

  return (
    <span className="flex items-center gap-1 text-[11px] text-muted/50">
      {symbols.map((sym, i) => (
        <kbd key={`mod-${i}`} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans font-medium">{sym}</kbd>
      ))}
      <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans font-medium">{keyLabel}</kbd>
    </span>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

type SpotlightOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onFocusWindow: (windowId: string) => void;
  onRunShortcut: (shortcutId: string, options?: { ignoreSurfaceState?: boolean }) => boolean;
};

export function SpotlightOverlay(props: SpotlightOverlayProps) {
  return (
    <AnimatePresence>
      {props.isOpen ? (
        <motion.div
          key="spotlight-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[18vh]"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) props.onClose();
          }}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onPointerDown={props.onClose}
          />
          <SpotlightOverlayContent {...props} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SpotlightOverlayContent({
  onClose,
  onOpenApp,
  onFocusWindow,
  onRunShortcut,
}: SpotlightOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Pull searchable state from the store
  const apps = useOSStore((s) => s.apps);
  const appMap = useOSStore((s) => s.appMap);
  const windows = useOSStore((s) => s.windows);
  const fsNodes = useOSStore((s) => s.fsNodes);
  const fsNodeMap = useOSStore((s) => s.fsNodeMap);
  const shortcuts = useOSStore((s) => s.shortcuts);
  const updateSettings = useOSStore((s) => s.updateSettings);
  const osSettings = useOSStore((s) => s.osSettings);

  const getPath = useCallback(
    (nodeId: string) => getNodePath(nodeId, fsNodeMap),
    [fsNodeMap],
  );

  const groups = useMemo<SpotlightResultGroup[]>(
    () =>
      spotlightSearch({
        query,
        apps,
        windows,
        appMap,
        fsNodes,
        shortcuts,
        systemShortcutBindings: getSystemShortcutBindings(osSettings.shortcutBindings),
        getNodePath: getPath,
      }),
    [query, apps, windows, appMap, fsNodes, shortcuts, osSettings.shortcutBindings, getPath],
  );

  const flatResults = useMemo(() => flattenResults(groups), [groups]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, flatResults.length - 1));

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;

    const selected = listRef.current.querySelector("[data-selected='true']");

    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [safeSelectedIndex]);

  const executeResult = useCallback(
    (result: SpotlightResult) => {
      onClose();

      switch (result.category) {
        case "app":
          onOpenApp(result.appId);
          break;
        case "window":
          onFocusWindow(result.windowId);
          break;
        case "file": {
          // Open the Files app (it will handle navigation)
          onOpenApp("files");
          break;
        }
        case "shortcut": {
          if (result.shortcutId === "os:spotlight") {
            break;
          }

          if (onRunShortcut(result.shortcutId, { ignoreSurfaceState: true })) {
            break;
          }

          const shortcut = shortcuts.find((s) => s.id === result.shortcutId);

          if (shortcut) {
            shortcut.action();
          }

          break;
        }
        case "action": {
          if (result.actionId === "toggle-dark-mode") {
            const nextScheme = osSettings.colorScheme === "dark" ? "light" : "dark";

            void updateSettings({ colorScheme: nextScheme });
          }

          if (result.actionId === "toggle-dock-autohide") {
            void updateSettings({ dockAutohide: !osSettings.dockAutohide });
          }

          break;
        }
      }
    },
    [onClose, onOpenApp, onFocusWindow, onRunShortcut, osSettings, shortcuts, updateSettings],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1,
          );
          break;
        case "Enter":
          event.preventDefault();
          if (flatResults[safeSelectedIndex]) {
            executeResult(flatResults[safeSelectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [flatResults, safeSelectedIndex, executeResult, onClose],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className="relative w-full max-w-[580px] overflow-hidden rounded-2xl border border-white/15 bg-surface/90 shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl"
      onKeyDown={handleKeyDown}
    >
            {/* Search input row */}
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3.5">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-5 w-5 shrink-0 text-muted/60"
              >
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search apps, files, shortcuts..."
                className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted/40 outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="rounded-md p-0.5 text-muted/50 transition-colors hover:text-foreground"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-muted/50">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results */}
            {flatResults.length > 0 ? (
              <div
                ref={listRef}
                className="max-h-[380px] overflow-y-auto overscroll-contain px-2 py-2"
              >
                {groups.map((group) => (
                  <div key={group.category} className="mb-1 last:mb-0">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <CategoryIcon category={group.category} />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted/50">
                        {group.label}
                      </span>
                    </div>
                    {group.results.map((result) => {
                      const globalIndex = flatResults.indexOf(result);
                      const isSelected = globalIndex === safeSelectedIndex;
                      const app =
                        result.category === "app" || result.category === "window"
                          ? appMap[result.appId]
                          : undefined;

                      return (
                        <button
                          key={result.id}
                          type="button"
                          data-selected={isSelected}
                          onClick={() => executeResult(result)}
                          onPointerEnter={() => setSelectedIndex(globalIndex)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                            isSelected
                              ? "bg-accent/20 text-foreground"
                              : "text-foreground/80 hover:bg-white/5"
                          }`}
                        >
                          {app ? (
                            <AppIconSmall app={app} />
                          ) : (
                            <CategoryIcon category={result.category} />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium">
                              {result.label}
                            </div>
                            {result.category === "shortcut" && result.binding ? (
                              <ShortcutBindingDisplay binding={result.binding} />
                            ) : result.detail ? (
                              <div className="truncate text-[11px] text-muted/50">
                                {result.detail}
                              </div>
                            ) : null}
                          </div>
                          {isSelected ? (
                            <kbd className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted/40">
                              Enter
                            </kbd>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="px-5 py-8 text-center text-[13px] text-muted/40">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-[13px] text-muted/40">
                Type to search across apps, files, and shortcuts
              </div>
            )}

            {/* Footer hints */}
            <div className="flex items-center justify-between border-t border-white/6 px-4 py-2 text-[10px] text-muted/30">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="rounded border border-white/8 px-1 py-px">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="rounded border border-white/8 px-1 py-px">↵</kbd> open
                </span>
                <span>
                  <kbd className="rounded border border-white/8 px-1 py-px">esc</kbd> close
                </span>
              </div>
              {flatResults.length > 0 ? (
                <span>{flatResults.length} result{flatResults.length !== 1 ? "s" : ""}</span>
              ) : null}
            </div>
          </motion.div>
  );
}
