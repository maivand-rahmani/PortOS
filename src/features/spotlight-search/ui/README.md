# spotlight-search/ui

React component for the spotlight search overlay.

## Files

- `spotlight-overlay.tsx` — full overlay component with input, grouped results, keyboard navigation, and Framer Motion transitions

Reads search targets directly from the OS store and delegates result execution to parent callbacks (`onOpenApp`, `onFocusWindow`, `onClose`).
