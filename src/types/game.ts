import type { FoundationIndex, Foundations, GameState, TableauIndex } from './state.js';

export type Game = {
  state: GameState;
  a: Foundations

  // Draws 3 cards from stock to waste.
  draw(): Game;

  // Moves the top waste card to a tableau pile.
  moveWasteToTableau(tableauIndex: TableauIndex): Game;

  // Moves the top waste card to a foundation pile.
  moveWasteToFoundation(foundationIndex: FoundationIndex): Game;

  // Moves the top card from one tableau pile to another.
  moveTableauToTableau(from: TableauIndex, to: TableauIndex): Game;

  // Moves the top card from a tableau pile to a foundation pile.
  moveTableauToFoundation(tableauIndex: TableauIndex, foundationIndex: FoundationIndex): Game;
};
