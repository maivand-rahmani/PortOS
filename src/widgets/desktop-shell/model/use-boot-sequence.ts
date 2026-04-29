"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useOSStore } from "@/processes";
import { runDataMigration } from "@/shared/lib/fs/fs-migration";
import { BOOT_PHASE_DURATIONS, BOOT_PROGRESS_KEYFRAMES, BOOT_SESSION_KEY } from "./desktop-shell.constants";
import type { OSBootPhase } from "@/processes";

export function useBootSequence(
  bootPhase: OSBootPhase,
  setBootPhase: (phase: OSBootPhase) => void,
  setBootProgress: (progress: number) => void,
  addBootMessage: (message: string) => void,
  completeBoot: () => void,
  hydrateFileSystem: () => Promise<void>,
  hydrateSettings: () => Promise<void>,
): void {
  const shouldReduceMotion = useReducedMotion();

  // ── Boot sequence state machine ──────────────────────────────────────────────
  useEffect(() => {
    if (bootPhase !== "off") {
      return undefined;
    }

    // Check sessionStorage for same-session revisit (auto-skip)
    if (typeof window !== "undefined" && sessionStorage.getItem(BOOT_SESSION_KEY)) {
      // Fast boot: skip cinematic sequence, still hydrate data
      const fastBootHydration = hydrateFileSystem()
        .then(() => runDataMigration())
        .catch((err) => {
          console.error("Boot hydration failed:", err);
          useOSStore.getState().pushNotification({
            title: "System",
            body: "Failed to restore file system. Some data may be unavailable.",
            level: "warning",
            appId: "system",
          });
        });

      void fastBootHydration;

      const settingsPromise = hydrateSettings().catch((err) => {
        console.error("Settings hydration failed:", err);
        useOSStore.getState().pushNotification({
          title: "System",
          body: "Failed to load settings. Using defaults.",
          level: "warning",
          appId: "system",
        });
      });

      void settingsPromise;

      setBootProgress(100);
      addBootMessage("System ready");
      completeBoot();
      return undefined;
    }

    // Start the cinematic boot: power-on phase
    setBootPhase("power-on");
    return undefined;
  }, [bootPhase, setBootPhase, setBootProgress, addBootMessage, completeBoot, hydrateFileSystem, hydrateSettings]);

  useEffect(() => {
    if (bootPhase !== "power-on") {
      return undefined;
    }

    const duration = shouldReduceMotion ? 100 : BOOT_PHASE_DURATIONS["power-on"];
    const timer = window.setTimeout(() => {
      setBootPhase("logo");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, setBootPhase, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "logo") {
      return undefined;
    }

    // Start hydration in parallel with logo animation
    const hydrationPromise = hydrateFileSystem()
      .then(() => runDataMigration())
      .catch((err) => {
        console.error("Boot hydration failed:", err);
        useOSStore.getState().pushNotification({
          title: "System",
          body: "Failed to restore file system. Some data may be unavailable.",
          level: "warning",
          appId: "system",
        });
      });

    const settingsPromise = hydrateSettings().catch((err) => {
      console.error("Settings hydration failed:", err);
      useOSStore.getState().pushNotification({
        title: "System",
        body: "Failed to load settings. Using defaults.",
        level: "warning",
        appId: "system",
      });
    });

    const duration = shouldReduceMotion ? 200 : BOOT_PHASE_DURATIONS.logo;
    const timer = window.setTimeout(async () => {
      // Wait for hydration to complete before moving to init
      await Promise.all([hydrationPromise, settingsPromise]);
      setBootPhase("init");
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, setBootPhase, hydrateFileSystem, hydrateSettings, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "init") {
      return undefined;
    }

    let cancelled = false;

    const runProgressSequence = async () => {
      for (const keyframe of BOOT_PROGRESS_KEYFRAMES) {
        if (cancelled) return;
        addBootMessage(keyframe.message);
        setBootProgress(keyframe.target);
        await new Promise((resolve) =>
          window.setTimeout(resolve, shouldReduceMotion ? 60 : keyframe.duration),
        );
      }

      if (!cancelled) {
        setBootPhase("reveal");
      }
    };

    void runProgressSequence();

    return () => {
      cancelled = true;
    };
  }, [bootPhase, setBootPhase, setBootProgress, addBootMessage, shouldReduceMotion]);

  useEffect(() => {
    if (bootPhase !== "reveal") {
      return undefined;
    }

    const duration = shouldReduceMotion ? 200 : BOOT_PHASE_DURATIONS.reveal;
    const timer = window.setTimeout(() => {
      // Mark session as booted for auto-skip on revisit
      if (typeof window !== "undefined") {
        sessionStorage.setItem(BOOT_SESSION_KEY, "1");
      }
      completeBoot();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [bootPhase, completeBoot, shouldReduceMotion]);
}
