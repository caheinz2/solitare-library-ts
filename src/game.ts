import type { Card } from './types/cards.js';
import type {
  FoundationIndex,
  Foundations,
  GameState,
  Stock,
  TableauIndex,
  Tableau,
  Waste,
} from './types/state.js';
import { createOrderedDeck, shuffleDeck } from './deck.js';
import { TABLEAU_INDICES } from './game-constants.js';

export type CreateGameOptions = Readonly<{
  rng?: () => number;
}>;

export class Game {
  private readonly gameState: GameState;

  private constructor(state: GameState) {
    this.gameState = state;
  }

  public static create(options: CreateGameOptions = {}): Game {
    const rng = options.rng ?? Math.random;
    const orderedDeck = createOrderedDeck();
    const shuffledDeck = shuffleDeck(orderedDeck, rng);
    const initialState = Game.dealInitialState(shuffledDeck);

    return new Game(initialState);
  }

  public get stock(): Stock {
    return this.gameState.stock;
  }

  public get waste(): Waste {
    return this.gameState.waste;
  }

  public get foundations(): Foundations {
    return this.gameState.foundations;
  }

  public get tableau(): Tableau {
    return this.gameState.tableau;
  }

  public debugString(): string {
    return JSON.stringify(
      {
        stock: this.stock,
        waste: this.waste,
        foundations: this.foundations,
        tableau: this.tableau,
      },
      null,
      2,
    );
  }

  // Draws 3 cards from stock to waste.
  public draw(): Game {
    throw new Error('Not implemented');
  }

  // Moves the top waste card to a tableau pile.
  public moveWasteToTableau(_tableauIndex: TableauIndex): Game {
    throw new Error('Not implemented');
  }

  // Moves the top waste card to a foundation pile.
  public moveWasteToFoundation(_foundationIndex: FoundationIndex): Game {
    throw new Error('Not implemented');
  }

  // Moves the top card from one tableau pile to another.
  public moveTableauToTableau(_from: TableauIndex, _to: TableauIndex): Game {
    throw new Error('Not implemented');
  }

  // Moves the top card from a tableau pile to a foundation pile.
  public moveTableauToFoundation(
    _tableauIndex: TableauIndex,
    _foundationIndex: FoundationIndex,
  ): Game {
    throw new Error('Not implemented');
  }

  private static dealInitialState(deck: ReadonlyArray<Card>): GameState {
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
  }
}
