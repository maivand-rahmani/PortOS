"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";

type DesktopRenameInputProps = {
  itemId: string;
  currentName: string;
  position: { x: number; y: number };
  siblingNames: string[];
  onCommit: (newName: string) => void;
  onCancel: () => void;
};

export function DesktopRenameInput({
  itemId: _itemId,
  currentName,
  position,
  siblingNames,
  onCommit,
  onCancel,
}: DesktopRenameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputWidth, setInputWidth] = useState(140);

  const computeSelection = useCallback((): [number, number] => {
    const lastDot = currentName.lastIndexOf(".");
    if (lastDot > 0) {
      return [0, lastDot];
    }
    return [0, currentName.length];
  }, [currentName]);

  const updateWidth = useCallback((value: string) => {
    const measure = measureRef.current;
    if (!measure) return;
    measure.textContent = value || currentName;
    const measured = measure.getBoundingClientRect().width;
    setInputWidth(Math.max(80, Math.min(measured + 12, 240)));
  }, [currentName]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    const [start, end] = computeSelection();
    input.setSelectionRange(start, end);
    updateWidth(input.value);
  }, [computeSelection, updateWidth]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const raw = inputRef.current?.value ?? "";
        const trimmed = raw.trim();

        if (trimmed.length === 0) {
          setError("Name cannot be empty");
          return;
        }

        if (trimmed !== currentName) {
          const nameLower = trimmed.toLowerCase();
          const isDuplicate = siblingNames.some(
            (name) => name.toLowerCase() === nameLower,
          );
          if (isDuplicate) {
            setError("A file with this name already exists");
            return;
          }
        }

        setError(null);
        const finalName = trimmed.length > 0 ? trimmed : currentName;
        if (finalName !== currentName) {
          onCommit(finalName);
        } else {
          onCancel();
        }
      }
    },
    [currentName, siblingNames, onCommit, onCancel],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError(null);
      updateWidth(e.target.value);
    },
    [error, updateWidth],
  );

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="pointer-events-auto absolute z-[100] rounded-xl border border-white/35 bg-[linear-gradient(180deg,rgba(36,43,57,0.82),rgba(19,24,34,0.88))] px-3 py-2 backdrop-blur-2xl"
      style={{
        left: position.x,
        top: position.y + 88,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        defaultValue={currentName}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        spellCheck={false}
        className="w-full bg-transparent text-xs font-medium leading-4 text-white/90 placeholder-white/50 outline-none ring-0 focus:ring-1 focus:ring-white/15"
        style={{ width: inputWidth }}
      />
      <span
        ref={measureRef}
        aria-hidden="true"
        className="invisible absolute left-0 top-0 whitespace-pre text-xs font-medium leading-4"
      />
      {error ? (
        <p className="mt-1.5 text-xs leading-4 text-red-400">{error}</p>
      ) : null}
    </motion.div>
  );
}
