import type { AiServiceContext } from "@/processes";
import type { OSSettings } from "./settings.types";
import type { SystemShortcutBinding } from "@/processes/os/model/shortcut-manager/shortcut-manager.types";

/**
 * Build the AI context published by the Settings app.
 *
 * Shares the full OS settings state so the AI palette can answer
 * questions about current preferences, suggest changes, and help
 * the user understand their configuration.
 */
export function buildSettingsAiContext(input: {
  windowId: string;
  activeSection: string;
  osSettings: OSSettings;
  shortcutBindings: SystemShortcutBinding[];
  wallpaperId: string;
  processCount: number;
  windowCount: number;
  fsNodeCount: number;
}): AiServiceContext {
  const shortcutSummary = input.shortcutBindings.map((binding) => ({
    id: binding.id,
    label: binding.label,
    scope: binding.scope,
    kind: binding.binding.kind,
    value:
      binding.binding.kind === "combo"
        ? [...binding.binding.modifiers, binding.binding.key].join("+")
        : binding.binding.steps.join(" → "),
  }));

  return {
    sourceAppId: "settings",
    sourceWindowId: input.windowId,
    appState: {
      activeSection: input.activeSection,
      colorScheme: input.osSettings.colorScheme,
      accentColor: input.osSettings.accentColor,
      dockIconSize: input.osSettings.dockIconSize,
      dockAutohide: input.osSettings.dockAutohide,
      reduceMotion: input.osSettings.reduceMotion,
      reduceTransparency: input.osSettings.reduceTransparency,
      wallpaperId: input.wallpaperId,
      shortcutBindings: shortcutSummary,
      systemStats: {
        processCount: input.processCount,
        windowCount: input.windowCount,
        fsNodeCount: input.fsNodeCount,
      },
    },
  };
}
