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
- Keep public API centered on `Game`; keep helper modules internal (not exported from `src/index.ts`).
- Prefer domain-specific internal file names (for example `deck.ts`, `state-copy.ts`, `state-ops.ts`, `game-constants.ts`) over generic `helper`/`util` names.

## Domain terminology
Use these names consistently:
- `stock`
- `waste`
- `tableau`
- `foundations`

## Public API direction
- Main export should center around a `Game` class/object.
- Initialization entrypoint should be `Game.create(options?: { rng?: () => number })`.
- Keep internal game state private; expose pile data via getters (`stock`, `waste`, `tableau`, `foundations`).
- API should stay intentionally limited to core actions for this project stage:
  - draw from stock (draw-3)
  - move top waste card to tableau/foundation
  - move top tableau card to tableau/foundation

## Type and code standards
- Prefer `type` aliases for public domain types unless interface extension is explicitly needed.
- Avoid `any`.
- Use `readonly` and `ReadonlyArray` where practical.
- Keep changes focused; avoid unrelated refactors.
- Use `Stack<T>` as a semantic alias over `ReadonlyArray<T>` unless a dedicated stack abstraction is explicitly needed.
- For runtime safety, getters should return defensive copies so external mutation does not mutate internal game state.

## State conventions
- Pile top is at the end of each array.
- Initial Klondike setup must deal tableau pile sizes `[1,2,3,4,5,6,7]`.
- Initial setup must leave `stock` with 24 cards and initialize `waste`/`foundations` empty.

## Testing standards
- Use Jest tests under `test/**/*.spec.ts`.
- For game logic changes, add/adjust tests for:
  - valid moves
  - invalid moves
  - pile transitions and edge cases
- For initialization changes, test deterministic setup via injected RNG and verify card conservation/uniqueness.
- For state exposure changes, add tests ensuring caller-side mutation of returned data does not mutate internal game state.

## Workflow expectations
- Before finishing a change, run:
  - `npm test`
  - (when relevant) `npm run build`
- Summarize what changed and why.
- If assumptions are needed, state them explicitly.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain docs layout. See `docs/agents/domain.md`.

## Non-goals (for now)
- UI/visualization
- Multiplayer/state sync
- Draw-1 mode
