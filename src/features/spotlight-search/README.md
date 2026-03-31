# spotlight-search

System-wide search overlay (Cmd+K) that queries across all OS entities:

- **Applications** — by name and description
- **Open windows** — by title
- **Files** — by name (from the VFS)
- **Keyboard shortcuts** — by label and key combo
- **System actions** — toggle dark mode, dock autohide, etc.

## Structure

- `model/spotlight-search.ts` — pure search logic with fuzzy matching and scoring
- `ui/spotlight-overlay.tsx` — Framer Motion overlay with text input, grouped results, and keyboard navigation
- `index.ts` — barrel exports

## Behavior

1. User presses Cmd+K (registered via the OS shortcut system)
2. Overlay appears centered in viewport with backdrop blur
3. Results appear instantly as the user types (no debounce needed for ~100 items)
4. Arrow keys navigate; Enter selects; Escape closes
5. Selecting an app opens/activates it; selecting a window focuses it; selecting a shortcut executes it
