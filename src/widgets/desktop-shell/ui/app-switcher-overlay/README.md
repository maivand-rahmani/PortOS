# app-switcher-overlay

Desktop-level app switcher overlay for cycling between running apps.

## Files

- `app-switcher-overlay.tsx` - renders the centered glass overlay showing running apps and the current selection.

Keyboard behavior lives in the shell model hook. This component only renders the current state and delegates selection and activation callbacks upward.
