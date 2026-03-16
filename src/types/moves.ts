import type { GameState } from "./state.js";

export type MoveHandler<TArgs extends ReadonlyArray<unknown> = []> = (
  state: GameState,
  ...args: TArgs
) => GameState;
