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
import { dealInitialState } from "./moves/deal-initial-state.js";
import { drawCards } from "./moves/draw-cards.js";
import { moveWasteCardToFoundation } from "./moves/move-waste-to-foundation.js";
import { copyFoundation } from "./utils/foundation-ops.js";
import { copyStack } from "./utils/stack-ops.js";

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
    return copyStack(this.gameState.stock);
  }

  public get waste(): Waste {
    return copyStack(this.gameState.waste);
  }

  public get foundations(): Foundations {
    const [first, second, third, fourth] = this.gameState.foundations;

    return [
      copyFoundation(first),
      copyFoundation(second),
      copyFoundation(third),
      copyFoundation(fourth),
    ];
  }

  public get tableau(): Tableau {
    const [first, second, third, fourth, fifth, sixth, seventh] =
      this.gameState.tableau;

    return [
      copyStack(first),
      copyStack(second),
      copyStack(third),
      copyStack(fourth),
      copyStack(fifth),
      copyStack(sixth),
      copyStack(seventh),
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
  public moveWasteToFoundation(foundationIndex: FoundationIndex): Game {
    this.gameState = moveWasteCardToFoundation(this.gameState, foundationIndex);
    return this;
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
