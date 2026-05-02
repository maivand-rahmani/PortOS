# desktop-marquee

Drag-to-select marquee overlay for the desktop.

## Files

- `desktop-marquee.tsx` — semi-transparent blue selection rectangle rendered during drag-to-select on empty desktop space.
- `index.ts` — barrel export.

The marquee renders above icons (z-20) but below context menus (z-30) and is driven by `useDesktopMarquee` from the model layer.
