import type { GameState } from "../types/state.js";

export const isStockAndWasteEmpty = (state: GameState): boolean =>
  state.stock.length === 0 && state.waste.length === 0;

export const isStockEmpty = (state: GameState): boolean =>
  state.stock.length === 0;
