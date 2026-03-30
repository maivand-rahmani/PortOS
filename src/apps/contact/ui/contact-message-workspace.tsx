import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Check, FileText, Mail, PencilLine, Send, Sparkles, User } from "lucide-react";

import { cn } from "@/shared/lib";

import type { ContactPreset } from "../model/contact-presets";
import type { ContactStatus } from "../model/use-contact-workspace";
import { ContactFieldBlock } from "./contact-field-block";
import { contactRadii } from "./contact-ui";

type ContactMessageWorkspaceProps = {
  actionStatus: ContactStatus;
  form: {
    name: string;
    email: string;
    message: string;
  };
  isSubmitting: boolean;
  paperLinesClassName: string;
  selectedPreset: ContactPreset;
  submitStatus: ContactStatus;
  onFieldChange: (field: "name" | "email" | "message", value: string) => void;
  onLoadPreset: () => void;
  onOpenPortfolioEvidence: () => void | Promise<void>;
  onOpenResumeEvidence: () => void | Promise<void>;
  onSendDraftToAgent: () => void | Promise<void>;
  onSendDraftToNotes: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
};

export function ContactMessageWorkspace({
  actionStatus,
  form,
  isSubmitting,
  paperLinesClassName,
  selectedPreset,
  submitStatus,
  onFieldChange,
  onLoadPreset,
  onOpenPortfolioEvidence,
  onOpenResumeEvidence,
  onSendDraftToAgent,
  onSendDraftToNotes,
  onSubmit,
}: ContactMessageWorkspaceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="flex min-h-0 flex-col bg-[#fffdf9] p-4 md:p-5">
      <motion.div
        layout
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-[3px] border-[#2d2d2d] bg-[#fffefb] shadow-[8px_8px_0px_0px_#2d2d2d]"
        style={{ borderRadius: contactRadii.panel }}
      >
        <div className={cn(paperLinesClassName, "pointer-events-none absolute inset-0 opacity-80")} />
        <div
          className="pointer-events-none absolute right-6 top-[-11px] h-6 w-24 bg-black/10"
          style={{ borderRadius: contactRadii.tape, transform: "rotate(5deg)" }}
        />

        <div className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#2d2d2d]/52">Outreach workspace</p>
                <p className="mt-2 text-xl text-[#2d2d2d]">{selectedPreset.label}</p>
                <p className="mt-2 max-w-3xl text-base leading-6 text-[#2d2d2d]/76">{selectedPreset.helper}</p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {actionStatus ? <StatusPill key={actionStatus.message} status={actionStatus} reduceMotion={reduceMotion} /> : null}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton label="Use preset" icon={Sparkles} tone="yellow" onClick={onLoadPreset} />
              <ActionButton label="To Notes" icon={FileText} tone="blue" onClick={onSendDraftToNotes} />
              <ActionButton label="To AI" icon={Bot} tone="neutral" onClick={onSendDraftToAgent} />
              <ActionButton label={selectedPreset.resumeLabel} icon={Check} tone="paper" onClick={onOpenResumeEvidence} />
              <ActionButton label={selectedPreset.portfolioLabel} icon={Check} tone="paper" onClick={onOpenPortfolioEvidence} />
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto px-5 py-5 md:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ContactFieldBlock label="Name" icon={User}>
              <input
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                placeholder="Your name"
                className="w-full border-0 bg-transparent text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
              />
            </ContactFieldBlock>

            <ContactFieldBlock label="Email" icon={Mail}>
              <input
                value={form.email}
                onChange={(event) => onFieldChange("email", event.target.value)}
                placeholder="you@example.com"
                className="w-full border-0 bg-transparent text-lg text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
              />
            </ContactFieldBlock>
          </div>

          <div className="mt-4">
            <ContactFieldBlock label="Message" icon={PencilLine} className="min-h-[280px] md:min-h-[320px]">
              <textarea
                value={form.message}
                onChange={(event) => onFieldChange("message", event.target.value)}
                placeholder="Tell me what you want to build, improve, or discuss."
                className="h-full min-h-[220px] w-full resize-none border-0 bg-transparent text-lg leading-8 text-[#2d2d2d] outline-none placeholder:text-[#2d2d2d]/35"
              />
            </ContactFieldBlock>
          </div>
        </div>

        <div className="relative border-t-[3px] border-dashed border-[#2d2d2d] px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-base text-[#2d2d2d]/64">Messages are validated before they are saved.</p>
              <AnimatePresence mode="wait" initial={false}>
                {submitStatus ? <StatusPill key={submitStatus.message} status={submitStatus} reduceMotion={reduceMotion} compact /> : null}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={isSubmitting}
              className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border-[3px] border-[#2d2d2d] bg-[#ff4d4d] px-5 py-2 text-lg text-white shadow-[4px_4px_0px_0px_#2d2d2d] transition duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25 disabled:cursor-not-allowed disabled:bg-[#f7a7a7] disabled:text-white/80 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#2d2d2d]"
              style={{ borderRadius: contactRadii.button }}
            >
              <Send className="h-4 w-4" strokeWidth={2.6} />
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

type StatusPillProps = {
  compact?: boolean;
  reduceMotion: boolean | null;
  status: NonNullable<ContactStatus>;
};

function StatusPill({ compact = false, reduceMotion, status }: StatusPillProps) {
  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      className={cn(
        "inline-flex items-center gap-2 border-[2px] px-4 py-2 text-base shadow-[4px_4px_0px_0px_#2d2d2d]",
        compact ? "w-fit" : "max-w-full",
        status.tone === "success"
          ? "border-[#2d2d2d] bg-[#e9f8ec] text-[#185b2b]"
          : status.tone === "error"
            ? "border-[#2d2d2d] bg-[#ffe5e5] text-[#8b1e1e]"
            : "border-[#2d2d2d] bg-white text-[#2d2d2d]",
      )}
      style={{ borderRadius: contactRadii.button }}
    >
      {status.tone === "success" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <PencilLine className="h-4 w-4" strokeWidth={2.5} />}
      <span>{status.message}</span>
    </motion.div>
  );
}

type ActionButtonProps = {
  icon: typeof Sparkles;
  label: string;
  onClick: () => void | Promise<void>;
  tone: "yellow" | "blue" | "neutral" | "paper";
};

function ActionButton({ icon: Icon, label, onClick, tone }: ActionButtonProps) {
  const toneClassName =
    tone === "yellow"
      ? "bg-[#fff9c4]"
      : tone === "blue"
        ? "bg-[#e8f0ff]"
        : tone === "neutral"
          ? "bg-white"
          : "bg-[#f6efe3]";

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center gap-2 border-[2px] border-[#2d2d2d] px-4 py-2 text-base text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] transition duration-150 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d5da1]/25",
        toneClassName,
      )}
      style={{ borderRadius: contactRadii.button }}
    >
      <Icon className="h-4 w-4" strokeWidth={2.4} />
      {label}
    </button>
  );
}
