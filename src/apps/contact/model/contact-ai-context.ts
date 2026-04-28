import type { AiServiceContext } from "@/processes";

export function buildContactAiContext(input: {
  windowId: string;
  selectedPresetId: string;
  selectedPresetLabel: string;
  formName: string;
  formEmail: string;
  formMessage: string;
}): AiServiceContext {
  return {
    sourceAppId: "contact",
    sourceWindowId: input.windowId,
    appState: {
      selectedPresetId: input.selectedPresetId,
      selectedPresetLabel: input.selectedPresetLabel,
      formName: input.formName,
      formEmail: input.formEmail,
      formMessage: input.formMessage,
    },
  };
}