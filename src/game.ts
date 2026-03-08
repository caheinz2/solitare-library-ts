import type { Card, Rank, Suit } from "./types/cards.js";
import type {
  FoundationIndex,
  GameState,
  TableauIndex,
} from "./types/state.js";

const SUITS: readonly Suit[] = ["clubs", "diamonds", "hearts", "spades"];
const RANKS: readonly Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const TABLEAU_INDICES: readonly TableauIndex[] = [0, 1, 2, 3, 4, 5, 6];

export type CreateGameOptions = Readonly<{
  rng?: () => number;
}>;

export class Game {
  public readonly state: GameState;

  private constructor(state: GameState) {
    this.state = state;
  }

  public static create(options: CreateGameOptions = {}): Game {
    const rng = options.rng ?? Math.random;
    const orderedDeck = Game.createOrderedDeck();
    const shuffledDeck = Game.shuffleDeck(orderedDeck, rng);
    const initialState = Game.dealInitialState(shuffledDeck);

    return new Game(initialState);
  }

  // Draws 3 cards from stock to waste.
  public draw(): Game {
    throw new Error("Not implemented");
  }

  // Moves the top waste card to a tableau pile.
  public moveWasteToTableau(_tableauIndex: TableauIndex): Game {
    throw new Error("Not implemented");
  }

  // Moves the top waste card to a foundation pile.
  public moveWasteToFoundation(_foundationIndex: FoundationIndex): Game {
    throw new Error("Not implemented");
  }

  // Moves the top card from one tableau pile to another.
  public moveTableauToTableau(_from: TableauIndex, _to: TableauIndex): Game {
    throw new Error("Not implemented");
  }

  // Moves the top card from a tableau pile to a foundation pile.
  public moveTableauToFoundation(
    _tableauIndex: TableauIndex,
    _foundationIndex: FoundationIndex,
  ): Game {
    throw new Error("Not implemented");
  }

  private static createOrderedDeck(): ReadonlyArray<Card> {
    const deck: Card[] = [];

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, faceUp: false });
      }
    }

    return deck;
  }

  private static shuffleDeck(
    deck: ReadonlyArray<Card>,
    rng: () => number,
  ): ReadonlyArray<Card> {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }

    return shuffled;
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
          throw new Error("Cannot initialize game with an incomplete deck");
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
