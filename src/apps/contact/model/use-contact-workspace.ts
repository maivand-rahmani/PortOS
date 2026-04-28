"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  openAgentWithRequest,
  openNotesWithRequest,
  openPortfolioWithFocus,
  openResumeWithFocus,
} from "@/shared/lib";

import {
  applyContactPreset,
  buildContactAgentRequest,
  buildContactBriefNoteRequest,
  contactPresets,
  getContactPreset,
  initialContactFormState,
  type ContactFormState,
} from "./contact-presets";

export type ContactStatusTone = "idle" | "success" | "error";

export type ContactStatus = {
  message: string;
  tone: ContactStatusTone;
} | null;

export function useContactWorkspace() {
  const [form, setForm] = useState<ContactFormState>(initialContactFormState);
  const [selectedPresetId, setSelectedPresetId] = useState(contactPresets[0].id);
  const [actionStatus, setActionStatus] = useState<ContactStatus>(null);
  const [submitStatus, setSubmitStatus] = useState<ContactStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionTimestamps = useRef<number[]>([]);

  const selectedPreset = useMemo(() => getContactPreset(selectedPresetId), [selectedPresetId]);

  const setField = useCallback((field: keyof ContactFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const loadPreset = useCallback(() => {
    setForm((current) => applyContactPreset(current, selectedPreset));
    setActionStatus({
      tone: "success",
      message: `Loaded the ${selectedPreset.label.toLowerCase()} draft into the message sheet.`,
    });
  }, [selectedPreset]);

  const sendDraftToNotes = useCallback(async () => {
    try {
      await openNotesWithRequest(buildContactBriefNoteRequest(selectedPreset, form));
      setActionStatus({
        tone: "success",
        message: `Sent the ${selectedPreset.label.toLowerCase()} draft to Notes.`,
      });
    } catch {
      setActionStatus({
        tone: "error",
        message: "Could not send this draft to Notes.",
      });
    }
  }, [form, selectedPreset]);

  const sendDraftToAgent = useCallback(async () => {
    try {
      await openAgentWithRequest(buildContactAgentRequest(selectedPreset, form));
      setActionStatus({
        tone: "success",
        message: `Opened the AI agent with the ${selectedPreset.label.toLowerCase()} handoff.`,
      });
    } catch {
      setActionStatus({
        tone: "error",
        message: "Could not hand this draft to the AI agent.",
      });
    }
  }, [form, selectedPreset]);

  const openPortfolioEvidence = useCallback(async () => {
    try {
      await openPortfolioWithFocus({
        ...selectedPreset.portfolioFocus,
        source: `Contact / ${selectedPreset.label}`,
      });
      setActionStatus({
        tone: "success",
        message: `Opened Portfolio on the ${selectedPreset.portfolioLabel.toLowerCase()}.`,
      });
    } catch {
      setActionStatus({
        tone: "error",
        message: "Could not open the supporting portfolio proof.",
      });
    }
  }, [selectedPreset]);

  const openResumeEvidence = useCallback(async () => {
    try {
      await openResumeWithFocus({
        ...selectedPreset.resumeFocus,
        source: `Contact / ${selectedPreset.label}`,
      });
      setActionStatus({
        tone: "success",
        message: `Opened Resume on the ${selectedPreset.resumeLabel.toLowerCase()}.`,
      });
    } catch {
      setActionStatus({
        tone: "error",
        message: "Could not open the supporting resume evidence.",
      });
    }
  }, [selectedPreset]);

  const submitForm = useCallback(async () => {
    // Client-side rate limiting: block if 3+ submissions in the last 10 seconds
    const now = Date.now();
    const recentTimestamps = submissionTimestamps.current.filter((ts) => now - ts < 10_000);
    submissionTimestamps.current = [...recentTimestamps, now];

    if (recentTimestamps.length >= 3) {
      setIsSubmitting(false);
      setSubmitStatus({
        tone: "error",
        message: "Too many submissions. Please wait a moment.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string; submittedAt?: string };

      if (!response.ok) {
        setSubmitStatus({
          tone: "error",
          message: payload.error ?? "Submission failed.",
        });
        return;
      }

      setSubmitStatus({
        tone: "success",
        message: payload.submittedAt ? `Saved at ${payload.submittedAt}` : "Message saved.",
      });
      setForm(initialContactFormState);
    } catch {
      setSubmitStatus({
        tone: "error",
        message: "Submission failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return {
    actionStatus,
    form,
    isSubmitting,
    loadPreset,
    openPortfolioEvidence,
    openResumeEvidence,
    selectedPreset,
    selectedPresetId,
    presets: contactPresets,
    sendDraftToAgent,
    sendDraftToNotes,
    setField,
    setSelectedPresetId,
    submitForm,
    submitStatus,
  };
}
