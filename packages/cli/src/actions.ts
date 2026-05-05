import type { Game } from "solitaire-library-ts";
import type {
  Cursor,
  FoundationIndex,
  GameView,
  Selection,
  TableauIndex,
} from "./types.js";
import { normalizeCursor } from "./navigation.js";

export type CliState = Readonly<{
  game: Game;
  cursor: Cursor;
  selection: Selection | null;
  status: string;
}>;

export const handleEnter = (state: CliState): CliState => {
  if (state.cursor.area === "stock") {
    return drawFromStock(state);
  }

  if (!state.selection) {
    return selectSource(state);
  }

  if (isSameSource(state.selection, state.cursor)) {
    return handleCancel(state);
  }

  return attemptMove(state);
};

export const handleCancel = (state: CliState): CliState => ({
  ...state,
  selection: null,
  status: "Selection canceled.",
});

export const getGameView = (game: Game): GameView => ({
  stock: game.stock,
  waste: game.waste,
  foundations: game.foundations,
  tableau: game.tableau,
  isWon: game.isWon,
});

const drawFromStock = (state: CliState): CliState => {
  const before = getSnapshot(state.game);
  state.game.draw();

  return {
    ...state,
    selection: null,
    cursor: normalizeCursor(getGameView(state.game), state.cursor),
    status: before === getSnapshot(state.game) ? "No cards to draw." : "Drew cards.",
  };
};

const selectSource = (state: CliState): CliState => {
  const selection = getSelectionForCursor(state.game, state.cursor);

  if (!selection) {
    return {
      ...state,
      status: "Nothing to select.",
    };
  }

  return {
    ...state,
    selection,
    status: "Selected card.",
  };
};

const attemptMove = (state: CliState): CliState => {
  const before = getSnapshot(state.game);
  const movedCards = dispatchMove(state.game, state.selection!, state.cursor);
  const didMove = before !== getSnapshot(state.game);

  if (!didMove) {
    return {
      ...state,
      status: "Invalid move.",
    };
  }

  const view = getGameView(state.game);

  return {
    ...state,
    cursor: normalizeCursor(view, state.cursor),
    selection: null,
    status: state.game.isWon
      ? "You won!"
      : movedCards > 1
        ? "Moved cards."
        : "Moved card.",
  };
};

const dispatchMove = (
  game: Game,
  selection: Selection,
  cursor: Cursor,
): number => {
  if (selection.source === "waste") {
    return moveWaste(game, cursor);
  }

  if (selection.source === "foundation") {
    return moveFoundation(game, selection.foundationIndex, cursor);
  }

  return moveTableau(
    game,
    selection.tableauIndex,
    selection.cardIndex,
    cursor,
  );
};

const moveWaste = (game: Game, cursor: Cursor): number => {
  if (cursor.area === "foundation") {
    game.moveWasteToFoundation(cursor.foundationIndex);
    return 1;
  }

  if (cursor.area === "tableau") {
    game.moveWasteToTableau(cursor.tableauIndex);
    return 1;
  }

  return 0;
};

const moveFoundation = (
  game: Game,
  foundationIndex: FoundationIndex,
  cursor: Cursor,
): number => {
  if (cursor.area !== "tableau") {
    return 0;
  }

  game.moveFoundationToTableau(foundationIndex, cursor.tableauIndex);
  return 1;
};

const moveTableau = (
  game: Game,
  from: TableauIndex,
  cardIndex: number,
  cursor: Cursor,
): number => {
  if (cursor.area === "foundation") {
    const sourcePile = game.tableau[from]!;

    if (cardIndex !== sourcePile.length - 1) {
      return 0;
    }

    game.moveTableauToFoundation(from, cursor.foundationIndex);
    return 1;
  }

  if (cursor.area === "tableau") {
    const sourcePile = game.tableau[from]!;
    const count = sourcePile.length - cardIndex;

    game.moveTableauToTableau(from, cursor.tableauIndex, count);
    return count;
  }

  return 0;
};

const getSelectionForCursor = (
  game: Game,
  cursor: Cursor,
): Selection | null => {
  if (cursor.area === "waste") {
    return game.waste.length > 0 ? { source: "waste" } : null;
  }

  if (cursor.area === "foundation") {
    const foundation = game.foundations[cursor.foundationIndex]!;

    return foundation.cards.length > 0
      ? { source: "foundation", foundationIndex: cursor.foundationIndex }
      : null;
  }

  if (cursor.area === "tableau" && cursor.cardIndex !== null) {
    const card = game.tableau[cursor.tableauIndex]?.[cursor.cardIndex];

    return card?.faceUp
      ? {
          source: "tableau",
          tableauIndex: cursor.tableauIndex,
          cardIndex: cursor.cardIndex,
        }
      : null;
  }

  return null;
};

const isSameSource = (selection: Selection, cursor: Cursor): boolean => {
  if (selection.source === "waste") {
    return cursor.area === "waste";
  }

  if (selection.source === "foundation") {
    return (
      cursor.area === "foundation" &&
      cursor.foundationIndex === selection.foundationIndex
    );
  }

  return (
    cursor.area === "tableau" &&
    cursor.tableauIndex === selection.tableauIndex &&
    cursor.cardIndex === selection.cardIndex
  );
};

const getSnapshot = (game: Game): string => JSON.stringify(getGameView(game));
