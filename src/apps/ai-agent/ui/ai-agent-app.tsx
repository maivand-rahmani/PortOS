"use client";

import { useState } from "react";

import type { AppComponentProps } from "@/entities/app";
import { openAppById } from "@/shared/lib";

export function AIAgentApp({ processId }: AppComponentProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Ask about Maivand, PortOS, or open an app.");

  async function submitQuestion() {
    if (!question.trim()) {
      return;
    }

    const lower = question.toLowerCase();

    if (lower.startsWith("open ")) {
      const appId = lower.replace(/^open\s+/, "").trim();
      await openAppById(appId);
      setAnswer(`Opening ${appId} if it exists.`);
      return;
    }

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const payload = (await response.json()) as { answer: string };

    setAnswer(payload.answer);
  }

  return (
    <div className="ai-agent-app flex h-full flex-col gap-4 rounded-[24px] p-4">
      <div className="rounded-[24px] bg-white/82 p-5 shadow-panel">
        <p className="text-[11px] uppercase tracking-[0.24em] text-violet-700/60">AI Agent</p>
        <p className="mt-2 text-sm text-violet-950/60">Assistant process {processId.slice(0, 6)}</p>
      </div>
      <div className="min-h-0 flex-1 rounded-[24px] bg-white/82 p-5 shadow-panel">
        <div className="rounded-[20px] border border-violet-100 bg-white/86 p-4 text-sm leading-7 text-violet-950/78">{answer}</div>
        <div className="mt-4 flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void submitQuestion();
              }
            }}
            placeholder="Ask a question or type: open docs"
            className="flex-1 rounded-full border border-violet-200 bg-white/90 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400/60"
          />
          <button type="button" onClick={() => void submitQuestion()} className="cursor-pointer rounded-full bg-violet-500 px-4 py-3 text-sm font-semibold text-white">Send</button>
        </div>
      </div>
    </div>
  );
}
