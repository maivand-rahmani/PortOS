# clock-app

Composed Clock workspace for live timezone tracking, spotlight state, planner tools, and external focus requests.

## Files

- `clock-app.tsx`: main client container that coordinates clock state, favorites, spotlight focus, and OS events.
- `clock-app.helpers.ts`: local storage, planner formatting, and browser-timezone helpers.
- `city-clock-card.tsx`: individual tracked city card with spotlight and favorite controls.
- `favorite-chip.tsx`: draggable favorite chip used above the main grid.
- `mini-analog-clock.tsx`: reusable analog dial renderer for spotlight and city cards.
- `planner-panel.tsx`: meeting planner sidebar with quick shifts and copyable summary state.
- `search-results-panel.tsx`: searchable timezone directory results list.
- `spotlight-panel.tsx`: featured hero view for the currently focused city.
