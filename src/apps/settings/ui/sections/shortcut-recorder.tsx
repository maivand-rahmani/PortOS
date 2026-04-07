"use client";

import { useEffect, useRef, useState } from "react";
import type { ShortcutBinding, ShortcutModifier, ShortcutSequenceKey } from "@/processes";

const MODIFIER_MAP: Record<string, ShortcutModifier> = {
  Meta: "meta",
  Control: "ctrl",
  Alt: "alt",
  Shift: "shift",
};

export function ShortcutRecorder({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (binding: ShortcutBinding) => void;
}) {
  const [pressedModifiers, setPressedModifiers] = useState<Set<ShortcutModifier>>(new Set());
  const [sequenceSteps, setSequenceSteps] = useState<ShortcutSequenceKey[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the container so it receives keyboard events, or just attach to window.
    // Attaching to window is easier and catches everything.
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape" && pressedModifiers.size === 0 && sequenceSteps.length === 0) {
        onCancel();
        return;
      }

      if (MODIFIER_MAP[event.key]) {
        setPressedModifiers((prev) => {
          const next = new Set(prev);
          next.add(MODIFIER_MAP[event.key]!);
          return next;
        });
        return;
      }

      // If it's a regular key, check if modifiers are held.
      const hasModifiers = event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;

      if (hasModifiers) {
        // It's a combo binding. We construct it and save immediately.
        const modifiersArray: ShortcutModifier[] = [];
        if (event.metaKey) modifiersArray.push("meta");
        if (event.ctrlKey) modifiersArray.push("ctrl");
        if (event.altKey) modifiersArray.push("alt");
        if (event.shiftKey) modifiersArray.push("shift");

        onSave({
          kind: "combo",
          key: event.key.toLowerCase() === "space" ? " " : event.key, // Normalizing space to " " might not be needed if it already is " "
          modifiers: modifiersArray,
        });
        return;
      }

      // It's a key without modifiers. It could be the start of a sequence, or a single key combo (which we might reject later, but let's see).
      let normalizedKey: ShortcutSequenceKey | null = null;
      if (event.key === " " || event.code === "Space") {
        normalizedKey = "space";
      } else if (event.key.length === 1 && /^[a-z]$/i.test(event.key)) {
        normalizedKey = event.key.toLowerCase() as ShortcutSequenceKey;
      }

      if (!normalizedKey) {
        // Unrecognized key without modifiers (e.g. F1, Tab, Enter). Treat as combo with no modifiers?
        // Let's just treat it as a combo with no modifiers for now.
        onSave({
          kind: "combo",
          key: event.key,
          modifiers: [],
        });
        return;
      }

      // We have a valid sequence key.
      setSequenceSteps((prev) => {
        const next = [...prev, normalizedKey];
        if (next.length === 2) {
          // Complete sequence
          if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
          
          // Wait a tick to let React render the second key before closing?
          // No, just save it. The parent will unmount this component.
          // Need to use setTimeout to avoid React state updates during render issues, though event handler is safe.
          setTimeout(() => {
            onSave({
              kind: "sequence",
              steps: next,
            });
          }, 0);
          return next;
        }

        // It's the first step. Start the timer.
        if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = setTimeout(() => {
          // Timer expired, treat as a single key combo (which will likely be invalid, but that's the user's problem).
          onSave({
            kind: "combo",
            key: next[0] === "space" ? " " : next[0],
            modifiers: [],
          });
        }, 500); // 500ms to press the second key

        return next;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (MODIFIER_MAP[event.key]) {
        setPressedModifiers((prev) => {
          const next = new Set(prev);
          next.delete(MODIFIER_MAP[event.key]!);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, [onCancel, onSave, pressedModifiers.size, sequenceSteps.length]);

  return (
    <div
      ref={containerRef}
      className="flex h-[38px] items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 shadow-[0_0_0_1px_rgba(10,132,255,0.2)_inset]"
    >
      {sequenceSteps.length > 0 ? (
        <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
          {sequenceSteps.map((step, i) => (
            <span key={i} className="rounded bg-accent/20 px-1.5 py-0.5">
              {step === "space" ? "Space" : step.toUpperCase()}
            </span>
          ))}
          {sequenceSteps.length === 1 && <span className="animate-pulse">...</span>}
        </div>
      ) : pressedModifiers.size > 0 ? (
        <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
          {Array.from(pressedModifiers).map((mod) => (
            <span key={mod} className="rounded bg-accent/20 px-1.5 py-0.5">
              {mod}
            </span>
          ))}
          <span className="animate-pulse text-accent/60">+</span>
        </div>
      ) : (
        <span className="text-sm font-medium text-accent/80 animate-pulse">
          Press keys to record...
        </span>
      )}
    </div>
  );
}
