import type { AgentExternalRequest, NotesExternalRequestDetail, PortfolioFocusRequest, ResumeFocusRequest } from "@/shared/lib";

export type ContactFormState = {
  name: string;
  email: string;
  message: string;
};

export type ContactPresetId = "recruiter" | "client" | "case-study";

export type ContactPreset = {
  id: ContactPresetId;
  label: string;
  audience: string;
  summary: string;
  helper: string;
  messageTemplate: string;
  noteTitle: string;
  noteTags: string[];
  agentTitle: string;
  suggestions: string[];
  portfolioLabel: string;
  resumeLabel: string;
  portfolioFocus: PortfolioFocusRequest;
  resumeFocus: ResumeFocusRequest;
};

export const initialContactFormState: ContactFormState = {
  name: "",
  email: "",
  message: "",
};

export const contactPresets: ContactPreset[] = [
  {
    id: "recruiter",
    label: "Recruiter Intro",
    audience: "Hiring and recruiting",
    summary: "Fast first message for role alignment, availability, and proof.",
    helper: "Pair a concise intro with the strongest frontend resume lens and recruiter-friendly project proof.",
    messageTemplate: [
      "Hi Maivand,",
      "",
      "I am reaching out about a frontend/product engineering role and would like to explore fit.",
      "",
      "What I am hiring for:",
      "- team or company:",
      "- role scope:",
      "- stage / product context:",
      "- timeline:",
      "",
      "If it helps, I would also like your most relevant resume lens and one or two projects to review before we schedule time.",
      "",
      "Best,",
      "[Your name]",
    ].join("\n"),
    noteTitle: "Recruiter Outreach Draft",
    noteTags: ["contact", "recruiter", "outreach"],
    agentTitle: "Refine recruiter outreach",
    suggestions: [
      "Tighten this into a concise recruiter email.",
      "Highlight the best resume lens to send first.",
      "Suggest a stronger subject line and follow-up.",
    ],
    portfolioLabel: "Recruiter proof set",
    resumeLabel: "Frontend resume lens",
    portfolioFocus: {
      handoffId: "recruiter",
      source: "Contact recruiter flow",
    },
    resumeFocus: {
      lensId: "frontend",
      sectionId: "timeline",
      source: "Contact recruiter flow",
    },
  },
  {
    id: "client",
    label: "Client Inquiry",
    audience: "Freelance or product work",
    summary: "Capture scope, constraints, and decision context before a discovery call.",
    helper: "Use this when someone needs shipping help, product cleanup, or a scoped build plan.",
    messageTemplate: [
      "Hi Maivand,",
      "",
      "I would like to discuss a project and see whether you are a fit to help ship it.",
      "",
      "Project brief:",
      "- company / product:",
      "- what needs to be built or improved:",
      "- current stack or constraints:",
      "- desired launch window:",
      "- budget range or engagement model:",
      "",
      "If useful, please point me to the most relevant case study and a recommended next step for a discovery call.",
      "",
      "Thanks,",
      "[Your name]",
    ].join("\n"),
    noteTitle: "Client Discovery Draft",
    noteTags: ["contact", "client", "brief"],
    agentTitle: "Shape client discovery outreach",
    suggestions: [
      "Turn this into a sharper discovery email.",
      "List the missing scope questions to ask next.",
      "Recommend the best portfolio proof to send.",
    ],
    portfolioLabel: "Client case-study handoff",
    resumeLabel: "Product lens",
    portfolioFocus: {
      handoffId: "client",
      source: "Contact client flow",
    },
    resumeFocus: {
      lensId: "product",
      sectionId: "playbook",
      source: "Contact client flow",
    },
  },
  {
    id: "case-study",
    label: "Case Study Follow-Up",
    audience: "Deeper project review",
    summary: "Ask for a walkthrough, technical proof, or portfolio follow-up after first contact.",
    helper: "Useful when the conversation has moved beyond hello and needs specific evidence or deeper discussion.",
    messageTemplate: [
      "Hi Maivand,",
      "",
      "I have reviewed your work and would like to continue the conversation with a more specific follow-up.",
      "",
      "What I want to cover:",
      "- project or case study I want to discuss:",
      "- technical or product questions:",
      "- decision criteria:",
      "- ideal next step:",
      "",
      "Please share the strongest supporting project details or resume evidence for this conversation.",
      "",
      "Best,",
      "[Your name]",
    ].join("\n"),
    noteTitle: "Case Study Follow-Up Draft",
    noteTags: ["contact", "portfolio", "follow-up"],
    agentTitle: "Prepare project follow-up outreach",
    suggestions: [
      "Refine this follow-up for a technical reviewer.",
      "Suggest stronger questions for a case-study discussion.",
      "Point me to the best supporting proof to send next.",
    ],
    portfolioLabel: "Technical proof handoff",
    resumeLabel: "Balanced resume lens",
    portfolioFocus: {
      handoffId: "technical",
      source: "Contact follow-up flow",
    },
    resumeFocus: {
      lensId: "balanced",
      sectionId: "timeline",
      source: "Contact follow-up flow",
    },
  },
];

export function getContactPreset(presetId?: string) {
  return contactPresets.find((preset) => preset.id === presetId) ?? contactPresets[0];
}

export function applyContactPreset(form: ContactFormState, preset: ContactPreset): ContactFormState {
  return {
    ...form,
    message: preset.messageTemplate,
  };
}

function formatField(value: string, fallback: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : fallback;
}

function getDraftMessage(form: ContactFormState, preset: ContactPreset) {
  const normalized = form.message.trim();

  return normalized.length > 0 ? normalized : preset.messageTemplate;
}

export function buildContactBriefNoteRequest(preset: ContactPreset, form: ContactFormState): NotesExternalRequestDetail {
  const senderName = formatField(form.name, "Unknown sender");
  const senderEmail = formatField(form.email, "No email provided yet");

  return {
    mode: "create",
    title: `${preset.noteTitle} - ${senderName}`,
    body: [
      `Flow: ${preset.label}`,
      `Audience: ${preset.audience}`,
      `Sender: ${senderName}`,
      `Email: ${senderEmail}`,
      "",
      "Draft:",
      getDraftMessage(form, preset),
      "",
      "Recommended proof:",
      `- Resume: ${preset.resumeLabel}`,
      `- Portfolio: ${preset.portfolioLabel}`,
      "",
      `Source: PortOS Contact / ${preset.label}`,
    ].join("\n"),
    tags: [...preset.noteTags, "contact-workspace"],
    pinned: true,
    selectAfterWrite: true,
    source: `contact:${preset.id}`,
  };
}

export function buildContactAgentRequest(preset: ContactPreset, form: ContactFormState): AgentExternalRequest {
  const senderName = formatField(form.name, "Unknown sender");
  const senderEmail = formatField(form.email, "No email provided yet");

  return {
    title: preset.agentTitle,
    prompt: [
      `You are helping refine a contact draft from the PortOS contact app for the ${preset.label} flow.`,
      `Audience: ${preset.audience}`,
      `Sender name: ${senderName}`,
      `Sender email: ${senderEmail}`,
      "",
      "Current draft:",
      getDraftMessage(form, preset),
      "",
      "Return:",
      "1. a tighter version of the message,",
      "2. one stronger subject line,",
      "3. the best resume or portfolio proof to send next,",
      "4. one concise follow-up if there is no reply.",
    ].join("\n"),
    source: {
      appId: "contact",
      label: preset.label,
    },
    suggestions: preset.suggestions,
  };
}
