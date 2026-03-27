import { ArrowUp, SquarePen } from "lucide-react";

import { cn } from "@/shared/lib";

type InputProps = {
  value: string;
  isStreaming: boolean;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
};

export function Input({ value, isStreaming, onChange, onSubmit }: InputProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-end gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:flex">
          <SquarePen className="h-4.5 w-4.5" strokeWidth={2.1} />
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
            rows={1}
            placeholder="Message Maivand"
            className="max-h-40 min-h-[56px] w-full resize-none border-0 bg-transparent px-1 py-3 text-base leading-7 text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={isStreaming}
          aria-label={isStreaming ? "Generating response" : "Send message"}
          className={cn(
            "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/35",
            isStreaming ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800",
          )}
        >
          <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
