import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib";

import { contactRadii } from "./contact-ui";

type ContactFieldBlockProps = {
  label: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
};

export function ContactFieldBlock({ label, icon: Icon, className, children }: ContactFieldBlockProps) {
  return (
    <label
      className={cn(
        "flex min-h-[76px] flex-col gap-3 border-[3px] border-[#2d2d2d] bg-white px-4 py-4 shadow-[4px_4px_0px_0px_#2d2d2d] focus-within:ring-4 focus-within:ring-[#2d5da1]/20",
        className,
      )}
      style={{ borderRadius: contactRadii.field }}
    >
      <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[#2d2d2d]/54">
        <Icon className="h-4 w-4 text-[#2d5da1]" strokeWidth={2.4} />
        {label}
      </span>
      <div className="min-h-0 flex-1">{children}</div>
    </label>
  );
}
