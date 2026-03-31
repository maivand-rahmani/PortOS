# boot-overlay

Cinematic startup overlay shown before the desktop is ready. Simulates a real OS boot sequence with five phases: power-on, logo reveal, system initialization, desktop reveal, and ready.

## Files

- `boot-overlay.tsx`: Phase orchestrator. Renders the appropriate sub-components based on the current `OSBootPhase`. Manages AnimatePresence transitions between phases.
- `boot-logo.tsx`: Animated PortOS SVG logo with stroke-draw, gradient fill, breathing pulse, and click-ripple interaction.
- `boot-progress.tsx`: Thin progress bar with spring-based animation, shown during the init phase.
- `boot-messages.tsx`: Typewriter-style system messages displayed below the progress bar during init.
- `boot-effects.tsx`: Visual effect primitives: `PowerPulse` (capacitor-charge flash), `BacklightGlow` (radial glow behind logo), `BrightnessBloom` (reveal-phase white overlay).
- `index.ts`: Public export of `BootOverlay`.

## Boot phases

| Phase | Duration | Visual |
|-------|----------|--------|
| `off` | 0ms | Nothing rendered (initial state) |
| `power-on` | 600ms | Black screen with center light pulse |
| `logo` | 1400ms | SVG logo draws and fills, glow builds |
| `init` | ~2500ms | Progress bar advances, typewriter messages |
| `reveal` | 1000ms | Logo fades out, brightness bloom, desktop slides in |
| `ready` | - | Overlay removed from DOM |

## Session auto-skip

On same-tab revisit (detected via `sessionStorage`), the cinematic sequence is skipped and boot completes instantly (~0ms). A new browser tab always plays the full sequence.

## Reduced motion

All animations respect `prefers-reduced-motion`. When active, phases run at accelerated timings and visual effects are simplified or skipped.
