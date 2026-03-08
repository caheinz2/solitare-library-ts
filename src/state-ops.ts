import type { Card } from './types/cards.js';
import type { GameState } from './types/state.js';
import { TABLEAU_INDICES } from './game-constants.js';

export const dealInitialState = (deck: ReadonlyArray<Card>): GameState => {
  const workingDeck = [...deck];
  const tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  for (const tableauIndex of TABLEAU_INDICES) {
    const pileSize = tableauIndex + 1;
    const pile = tableau[tableauIndex];

    for (let cardIndex = 0; cardIndex < pileSize; cardIndex += 1) {
      const nextCard = workingDeck.pop();

      if (!nextCard) {
        throw new Error('Cannot initialize game with an incomplete deck');
      }

      pile.push({
        ...nextCard,
        faceUp: cardIndex === pileSize - 1,
      });
    }
  }

  const stock = workingDeck.map((card) => ({ ...card, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
};
