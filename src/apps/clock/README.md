# clock

World clock app with searchable worldwide timezone data, favorites, spotlight focus, meeting-planner support, and live timezone tracking.

## Folders and files

- `index.ts`: app metadata, larger default window sizing, fullscreen-on-launch behavior, and status bar actions.
- `theme.css`: cinematic dark glass theme and dial depth styling.
- `model/`: timezone data helpers, clock math, and planner formatting support.
- `ui/`: full app workspace with search directory, favorites, spotlight hero, planner, and tracked city wall.

## External integration

- `openClockWithFocus({ timeZone, source?, highlight? })`: opens Clock through shared OS actions and focuses a requested timezone in the matching clock window.
- `dispatchClockFocusRequest({ timeZone, source?, highlight?, targetWindowId? })`: lower-level window event bridge for shell or app integrations that already know which Clock window should respond.

## In-app features

- Spotlight mode promotes any tracked city into a large hero panel with relative local-time comparison.
- Meeting Planner previews a chosen local datetime across tracked cities, flags workday vs early/late/overnight windows, and can copy a plain-text schedule summary.
