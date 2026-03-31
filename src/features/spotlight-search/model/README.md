# spotlight-search/model

Pure search logic for the spotlight overlay.

## Files

- `spotlight-search.ts` — result types, fuzzy matching, per-category search functions, and `spotlightSearch()` entry point

All functions are pure (no side effects, no React dependencies). The UI layer calls these with store state to produce grouped results.
