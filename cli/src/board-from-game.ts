import type { BoardView, PlayableGame } from "./types/index.js";

export const createBoardView = (game: PlayableGame): BoardView => ({
  stockCount: game.stock.length,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
});
