"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type BootMessagesProps = {
  messages: string[];
};

const CHAR_DELAY_MS = 32;

export function BootMessages({ messages }: BootMessagesProps) {
  const shouldReduceMotion = useReducedMotion();
  const latestMessage = messages[messages.length - 1] ?? "";

  return (
    <div className="mt-3 flex h-5 items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={latestMessage}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center"
        >
          {shouldReduceMotion ? (
            <span className="font-mono text-[11px] tracking-wider text-white/50">
              {latestMessage}
            </span>
          ) : (
            <TypewriterText key={latestMessage} text={latestMessage} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (text.length === 0) return undefined;

    let frame: number;
    let current = 0;

    const tick = () => {
      current += 1;

      if (current > text.length) return;

      setCharCount(current);
      frame = window.setTimeout(tick, CHAR_DELAY_MS);
    };

    frame = window.setTimeout(tick, CHAR_DELAY_MS);

    return () => window.clearTimeout(frame);
  }, [text]);

  const displayed = useMemo(() => text.slice(0, charCount), [text, charCount]);
  const showCursor = charCount < text.length;

  return (
    <span className="font-mono text-[11px] tracking-wider text-white/50">
      {displayed}
      {showCursor ? (
        <span className="animate-pulse text-white/60">_</span>
      ) : null}
    </span>
  );
}
