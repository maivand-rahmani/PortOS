"use client";

import { useState } from "react";

import type { AppComponentProps } from "@/entities/app";

const STORAGE_KEY = "portos-notes-value";

export function NotesApp({ windowId }: AppComponentProps) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  });

  const savedAt = value ? new Date().toLocaleTimeString() : null;

  return (
    <div className="notes-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/72 p-4 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-yellow-700/60">Notes</p>
        <div className="mt-2 flex items-center justify-between text-sm text-yellow-900/60">
          <span>Window {windowId.slice(0, 4)}</span>
          <span>{savedAt ? `Saved at ${savedAt}` : "Ready"}</span>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;

          setValue(nextValue);
          window.localStorage.setItem(STORAGE_KEY, nextValue);
        }}
        placeholder="Write notes here..."
        className="min-h-0 flex-1 resize-none rounded-[24px] border border-yellow-200 bg-white/75 p-5 text-base leading-7 text-yellow-950 shadow-panel outline-none focus:ring-2 focus:ring-yellow-400/60"
      />
    </div>
  );
}
