import type { LucideIcon } from "lucide-react";

import { Check, CircleDot } from "lucide-react";

import type { ContactPreset } from "../model/contact-presets";
import { contactRadii } from "./contact-ui";

type ContactItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
};

type ContactSidebarProps = {
  contactItems: ContactItem[];
  markerFontClassName: string;
  presets: ContactPreset[];
  quickNotes: string[];
  selectedPresetId: string;
  onSelectPreset: (presetId: ContactPreset["id"]) => void;
};

export function ContactSidebar({
  contactItems,
  markerFontClassName,
  presets,
  quickNotes,
  selectedPresetId,
  onSelectPreset,
}: ContactSidebarProps) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 border-b-[3px] border-dashed border-[#2d2d2d] bg-[#f7f0e6] p-4 lg:border-b-0 lg:border-r-[3px]">
      <div
        className="border-[3px] border-[#2d2d2d] bg-white p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
        style={{ borderRadius: contactRadii.panel }}
      >
        <p className={markerFontClassName + " text-2xl text-[#2d2d2d]"}>Details</p>
        <div className="mt-4 space-y-3">
          {contactItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-start gap-3 rounded-[20px] border-[2px] border-[#2d2d2d] bg-[#fffefb] px-4 py-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-[#2d2d2d] bg-[#e8f0ff] text-[#2d5da1]">
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#2d2d2d]/52">{item.label}</p>
                  <p className="mt-1 break-words text-lg leading-6 text-[#2d2d2d]">{item.value}</p>
                </div>
              </div>
            );

            return item.href ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block transition duration-150 hover:-rotate-1">
                {content}
              </a>
            ) : (
              <div key={item.label}>{content}</div>
            );
          })}
        </div>
      </div>

      <div
        className="border-[3px] border-[#2d2d2d] bg-[#fff9c4] p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
        style={{ borderRadius: contactRadii.panel, transform: "rotate(-1deg)" }}
      >
        <p className={markerFontClassName + " text-2xl text-[#2d2d2d]"}>Quick notes</p>
        <div className="mt-4 space-y-3 text-lg leading-7 text-[#2d2d2d]/82">
          {quickNotes.map((note) => (
            <div key={note} className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#ff4d4d]" strokeWidth={2.6} />
              <p>{note}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-[3px] border-[#2d2d2d] bg-[#eef6ff] p-4 shadow-[4px_4px_0px_0px_#2d2d2d]"
        style={{ borderRadius: contactRadii.panel }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={markerFontClassName + " text-2xl text-[#2d2d2d]"}>Flows</p>
            <p className="mt-2 text-base leading-6 text-[#2d2d2d]/74">Choose the outreach context before drafting or handing off.</p>
          </div>
          <CircleDot className="mt-1 h-5 w-5 shrink-0 text-[#2d5da1]" strokeWidth={2.4} />
        </div>

        <div className="mt-4 space-y-3">
          {presets.map((preset) => {
            const isSelected = preset.id === selectedPresetId;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={[
                  "flex min-h-[88px] w-full cursor-pointer flex-col items-start gap-2 border-[2px] px-4 py-3 text-left shadow-[3px_3px_0px_0px_#2d2d2d] transition duration-150 hover:-rotate-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25",
                  isSelected ? "bg-[#fff9c4]" : "bg-[#fffefb]",
                ].join(" ")}
                style={{ borderRadius: "20px", borderColor: "#2d2d2d" }}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="text-lg leading-none text-[#2d2d2d]">{preset.label}</p>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[#2d2d2d]/54">{preset.audience}</span>
                </div>
                <p className="text-base leading-6 text-[#2d2d2d]/78">{preset.summary}</p>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
