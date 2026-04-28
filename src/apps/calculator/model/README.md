# model

Calculator state, input rules, and filesystem-backed tape persistence.

## Files

- `calculator-ai-context.ts`: builds the Calculator window context published to the OS AI service.
- `calculator-tape.ts`: tape persistence in `/System/apps/calculator/tape.json` plus Notes and AI handoff payload builders.
- `content.ts`: keypad rows used by the calculator app.
- `expression.ts`: calculator-friendly input rules for operators, decimals, and parentheses.
- `types.ts`: shared calculator model types.
- `use-calculator-controller.ts`: stateful controller for expression entry, tape actions, and OS handoff flows.
