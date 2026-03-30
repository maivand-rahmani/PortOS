# model

Calculator state, input rules, and tape persistence.

## Files

- `calculator-tape.ts`: persistent tape helpers plus Notes and AI handoff payload builders.
- `content.ts`: keypad rows used by the calculator app.
- `expression.ts`: calculator-friendly input rules for operators, decimals, and parentheses.
- `types.ts`: shared calculator model types.
- `use-calculator-controller.ts`: stateful controller for expression entry, tape actions, and OS handoff flows.
