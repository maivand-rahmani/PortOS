import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

type WindowTrafficButtonProps = {
  tone: "red" | "yellow" | "green";
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

export function WindowTrafficButton({
  tone,
  icon,
  label,
  onClick,
}: WindowTrafficButtonProps) {
  const tones = {
    red: "bg-[#ff5f57] text-[#6f120d]",
    yellow: "bg-[#febc2e] text-[#6e4a03]",
    green: "bg-[#28c840] text-[#0e5420]",
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/10 text-[0] transition duration-150 hover:text-[10px]",
        tones[tone],
      )}
    >
      {icon}
    </button>
  );
}
