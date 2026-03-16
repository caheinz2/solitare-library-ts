import type { Card } from "../src/index.js";
import { Game } from "../src/index.js";
import { getCardKey } from "./test-setup.js";

const getAllCards = (game: Game): Card[] => [
  ...game.stock,
  ...game.waste,
  ...game.foundations[0].cards,
  ...game.foundations[1].cards,
  ...game.foundations[2].cards,
  ...game.foundations[3].cards,
  ...game.tableau[0],
  ...game.tableau[1],
  ...game.tableau[2],
  ...game.tableau[3],
  ...game.tableau[4],
  ...game.tableau[5],
  ...game.tableau[6],
];

export const expectConservedUniqueDeck = (game: Game): void => {
  const allCards = getAllCards(game);
  const uniqueCardKeys = new Set(allCards.map(getCardKey));

  expect(allCards).toHaveLength(52);
  expect(uniqueCardKeys.size).toBe(52);
};

export const expectAllCardsFaceDirection = (
  cards: Card[],
  direction: "up" | "down",
): void => {
  const expectedFaceUp = direction === "up";

  cards.forEach((card) => {
    expect(card.faceUp).toBe(expectedFaceUp);
  });
};
