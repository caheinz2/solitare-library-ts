import type { Game } from "@caheinz2/solitaire-core";
import type { BoardView } from "./types/index.js";

export const createBoardView = (game: Game): BoardView => ({
  stockCount: game.stock.length,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
});
