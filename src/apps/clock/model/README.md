# model

World clock timezone data helpers and filesystem-backed preferences.

## Files

- `clock-ai-context.ts`: builds the Clock window context published to the OS AI service.
- `content.ts`: builds searchable worldwide timezone options from `@vvo/tzdb` and defines the default clock wall set.
- `time.ts`: shared clock math for analog hands, timezone comparison labels, and planner datetime helpers.

Clock favorites and ordering are persisted through the UI helpers into `/System/apps/clock/preferences.json`.
