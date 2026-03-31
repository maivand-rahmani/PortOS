# snap-guide-overlay

Translucent preview overlay shown during window drag when the pointer enters a snap zone (edge or corner of the screen).

## Files

- `snap-guide-overlay.tsx` — renders an animated rectangle matching the snap target frame; fades in/out with Framer Motion.

## Props

- `zone` — current `WindowSnapZone` or `null`
- `bounds` — current `DesktopBounds` or `null`

The overlay is pointer-events-none and sits at a high z-index so it floats above windows.
