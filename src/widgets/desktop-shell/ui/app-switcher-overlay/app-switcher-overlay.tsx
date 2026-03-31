"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { DockAppState } from "../../model/desktop-shell.types";
import { APP_SWITCHER_FALLBACK_LABEL } from "../../model/use-app-switcher";

type AppSwitcherOverlayProps = {
  isOpen: boolean;
  apps: DockAppState[];
  selectedAppId: string | null;
  onPreview: (appId: string) => void;
  onActivate: () => void;
};

export function AppSwitcherOverlay({
  isOpen,
  apps,
  selectedAppId,
  onPreview,
  onActivate,
}: AppSwitcherOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && apps.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[9750] flex items-center justify-center bg-black/16 backdrop-blur-sm"
        >
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="pointer-events-auto flex w-[min(42rem,calc(100vw-2rem))] flex-col gap-5 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(22,22,27,0.88),rgba(14,14,18,0.84))] px-5 py-5 shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <div className="text-[15px] font-semibold text-white/94">App Switcher</div>
                <div className="mt-1 text-[12px] text-white/44">
                  Cycle with {APP_SWITCHER_FALLBACK_LABEL}. Release Option to activate.
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium text-white/58">
                {apps.length} running app{apps.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {apps.map((item) => {
                const Icon = item.app.icon;
                const isSelected = item.app.id === selectedAppId;
                const secondaryLabel = item.visibleCount > 0
                  ? `${item.visibleCount} window${item.visibleCount === 1 ? "" : "s"}`
                  : item.minimizedCount > 0
                    ? `${item.minimizedCount} minimized`
                    : "Running";

                return (
                  <button
                    key={item.app.id}
                    type="button"
                    onMouseEnter={() => onPreview(item.app.id)}
                    onFocus={() => onPreview(item.app.id)}
                    onClick={onActivate}
                    className={`group flex flex-col items-center gap-3 rounded-[24px] border px-3 py-4 text-center transition-all ${
                      isSelected
                        ? "border-white/18 bg-white/12 shadow-[0_14px_38px_rgba(255,255,255,0.08)]"
                        : "border-white/8 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10">
                      <Icon className="h-10 w-10" />
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-white/92">
                        {item.app.name}
                      </span>
                      <span className="mt-1 block text-[11px] text-white/44">
                        {secondaryLabel}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
