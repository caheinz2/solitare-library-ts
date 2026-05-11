import { Game } from "../src/index.js";
import type { Card, GameState } from "../src/index.js";

export const getStateSnapshot = (game: Game): GameState => ({
  stock: game.stock,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
});

export const getCardKey = (card: Card): string => `${card.suit}-${card.rank}`;
