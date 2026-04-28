"use client";

import { useEffect, useMemo } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { Github, Mail, MapPin } from "lucide-react";

import type { AppComponentProps } from "@/entities/app";
import { useOSStore } from "@/processes";
import { cn, getProfileBasics } from "@/shared/lib";

import { buildContactAiContext } from "../model/contact-ai-context";
import { useContactWorkspace } from "../model/use-contact-workspace";
import styles from "../theme.module.css";
import { ContactMessageWorkspace } from "./contact-message-workspace";
import { ContactSidebar } from "./contact-sidebar";
import { contactRadii } from "./contact-ui";

type ContactProfile = {
  personal?: {
    name?: string;
    role?: string;
    location?: string;
    focus?: string;
  };
  links?: {
    gmail?: string;
    github?: string;
  };
  strengths?: string[];
};

const profile = getProfileBasics() as ContactProfile;

export function ContactApp({ processId, windowId }: AppComponentProps) {
  const reduceMotion = useReducedMotion();
  const aiPublishWindowContext = useOSStore((state) => state.aiPublishWindowContext);
  const aiClearWindowContext = useOSStore((state) => state.aiClearWindowContext);
  const {
    actionStatus,
    form,
    isSubmitting,
    loadPreset,
    openPortfolioEvidence,
    openResumeEvidence,
    presets,
    selectedPreset,
    selectedPresetId,
    sendDraftToAgent,
    sendDraftToNotes,
    setField,
    setSelectedPresetId,
    submitForm,
    submitStatus,
  } = useContactWorkspace();

  useEffect(() => {
    aiPublishWindowContext(
      windowId,
      buildContactAiContext({
        windowId,
        selectedPresetId,
        selectedPresetLabel: selectedPreset.label,
        formName: form.name,
        formEmail: form.email,
        formMessage: form.message,
      }),
    );
  }, [aiPublishWindowContext, form.email, form.message, form.name, selectedPreset.label, selectedPresetId, windowId]);

  useEffect(() => {
    return () => {
      aiClearWindowContext(windowId);
    };
  }, [aiClearWindowContext, windowId]);

  const contactItems = useMemo(
    () => [
      {
        label: "Email",
        value: profile.links?.gmail ?? "-",
        icon: Mail,
        href: profile.links?.gmail ? `mailto:${profile.links.gmail}` : undefined,
      },
      {
        label: "GitHub",
        value: profile.links?.github?.replace(/^https?:\/\//, "") ?? "-",
        icon: Github,
        href: profile.links?.github,
      },
      {
        label: "Location",
        value: profile.personal?.location ?? "Unknown",
        icon: MapPin,
      },
    ],
    [],
  );

  const quickNotes = (profile.strengths ?? []).slice(0, 3);

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.985 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(styles.app, "flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4 font-handwriting")}
    >
      <div
        className="flex min-h-0 flex-1 flex-col border-[3px] border-[#2d2d2d] bg-[#fdfbf7] shadow-[8px_8px_0px_0px_#2d2d2d]"
        style={{ borderRadius: contactRadii.shell }}
      >
        <header className="relative border-b-[3px] border-dashed border-[#2d2d2d] px-4 py-4 md:px-6">
          <div
            className="absolute left-6 top-[-10px] h-6 w-24 bg-black/10 opacity-70"
            style={{ borderRadius: contactRadii.tape, transform: "rotate(-4deg)" }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#2d2d2d]/65">
                <span
                  className="inline-flex items-center gap-2 border-[3px] border-[#2d2d2d] bg-[#fff9c4] px-4 py-1 uppercase tracking-[0.18em] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#2d2d2d]"
                  style={{ borderRadius: contactRadii.chip, transform: "rotate(-2deg)" }}
                >
                  <Mail className="h-4 w-4" strokeWidth={2.5} />
                  Contact
                </span>
                <span>Session {processId.slice(0, 6)}</span>
                <span>Window {windowId.slice(0, 4)}</span>
              </div>
              <h2 className={cn("mt-4 text-4xl leading-none text-[#2d2d2d] md:text-5xl font-marker")}>
                Plan the right outreach.
              </h2>
              <p className="mt-3 max-w-3xl text-lg leading-7 text-[#2d2d2d]/76">
                Start with a real hiring, client, or follow-up flow, then send the draft into Notes, the AI agent, Resume, or Portfolio without leaving Contact.
              </p>
            </div>

            <div className="text-right text-base text-[#2d2d2d]/72">
              <p>{profile.personal?.name ?? "Maivand Rahmani"}</p>
              <p>{profile.personal?.role ?? "Frontend Engineer"}</p>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ContactSidebar
            contactItems={contactItems}
            markerFontClassName="font-marker"
            presets={presets}
            quickNotes={quickNotes.length > 0 ? quickNotes : [profile.personal?.focus ?? "Building scalable products"]}
            selectedPresetId={selectedPresetId}
            onSelectPreset={setSelectedPresetId}
          />

          <ContactMessageWorkspace
            actionStatus={actionStatus}
            form={form}
            isSubmitting={isSubmitting}
            paperLinesClassName={styles.paperLines}
            selectedPreset={selectedPreset}
            submitStatus={submitStatus}
            onFieldChange={setField}
            onLoadPreset={loadPreset}
            onOpenPortfolioEvidence={openPortfolioEvidence}
            onOpenResumeEvidence={openResumeEvidence}
            onSendDraftToAgent={sendDraftToAgent}
            onSendDraftToNotes={sendDraftToNotes}
            onSubmit={submitForm}
          />
        </div>
      </div>
    </motion.div>
  );
}
