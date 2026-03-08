# AGENTS.md

Guidance for AI coding assistants working in this repository.

## Project scope
- Build a TypeScript library for **Klondike Solitaire (draw-3 only)**.
- Do not add support for other Solitaire variants unless explicitly requested.

## Collaboration goals
- Prioritize strong, explicit types.
- Keep APIs small and intentional.
- Favor immutable data and immutable operations.
- Add unit tests at an appropriate level (rule behavior and regressions, not excessive test noise).

## Current architecture conventions
- Keep shared type declarations in `src/types`.
- Keep `src/index.ts` minimal: exports only.
- Avoid putting business logic in `src/index.ts`.

## Domain terminology
Use these names consistently:
- `stock`
- `waste`
- `tableau`
- `foundations`

## Public API direction
- Main export should center around a `Game` type/object.
- API should stay intentionally limited to core actions for this project stage:
  - draw from stock (draw-3)
  - move top waste card to tableau/foundation
  - move top tableau card to tableau/foundation

## Type and code standards
- Prefer `type` aliases for public domain types unless interface extension is explicitly needed.
- Avoid `any`.
- Use `readonly` and `ReadonlyArray` where practical.
- Keep changes focused; avoid unrelated refactors.

## Testing standards
- Use Jest tests under `test/**/*.spec.ts`.
- For game logic changes, add/adjust tests for:
  - valid moves
  - invalid moves
  - pile transitions and edge cases

## Workflow expectations
- Before finishing a change, run:
  - `npm test`
  - (when relevant) `npm run build`
- Summarize what changed and why.
- If assumptions are needed, state them explicitly.

## Non-goals (for now)
- UI/visualization
- Multiplayer/state sync
- Draw-1 mode
