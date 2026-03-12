import type {
  FoundationIndex,
  Foundations,
  GameState,
  Stock,
  TableauIndex,
  Tableau,
  Waste,
} from "./types/state.js";
import { createOrderedDeck, shuffleDeck } from "./deck.js";
import { copyPile } from "./state-copy.js";
import { dealInitialState, drawCards } from "./state-ops.js";

export type CreateGameOptions = Readonly<{
  rng?: () => number;
}>;

export class Game {
  private gameState: GameState;

  private constructor(state: GameState) {
    this.gameState = state;
  }

  public static create(options: CreateGameOptions = {}): Game {
    const rng = options.rng ?? Math.random;
    const orderedDeck = createOrderedDeck();
    const shuffledDeck = shuffleDeck(orderedDeck, rng);
    const initialState = dealInitialState(shuffledDeck);

    return new Game(initialState);
  }

  public get stock(): Stock {
    return copyPile(this.gameState.stock);
  }

  public get waste(): Waste {
    return copyPile(this.gameState.waste);
  }

  public get foundations(): Foundations {
    const [first, second, third, fourth] = this.gameState.foundations;

    return [
      copyPile(first),
      copyPile(second),
      copyPile(third),
      copyPile(fourth),
    ];
  }

  public get tableau(): Tableau {
    const [first, second, third, fourth, fifth, sixth, seventh] =
      this.gameState.tableau;

    return [
      copyPile(first),
      copyPile(second),
      copyPile(third),
      copyPile(fourth),
      copyPile(fifth),
      copyPile(sixth),
      copyPile(seventh),
    ];
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
    this.gameState = drawCards(this.gameState);
    return this;
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
}
