import type { Card } from "../types/cards.js";
import type { Stack } from "../types/state.js";

export const peekTopCard = <T>(stack: Stack<T>): T | undefined =>
  stack[stack.length - 1];

export const removeTopCard = <T>(stack: Stack<T>): T | undefined => stack.pop();

export const addCardToTop = <T>(stack: Stack<T>, card: T): void => {
  stack.push(card);
};

export const flipTopCardFaceUp = (stack: Stack<Card>): void => {
  const topCard = peekTopCard(stack);

  if (!topCard) {
    return;
  }

  topCard.faceUp = true;
};

export const removeTopCardAndFlipNext = (
  stack: Stack<Card>,
): Card | undefined => {
  const removedCard = removeTopCard(stack);
  flipTopCardFaceUp(stack);

  return removedCard;
};

export const copyStack = (stack: Stack<Card>): Stack<Card> =>
  stack.map((card) => ({ ...card }));
