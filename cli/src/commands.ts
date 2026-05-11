import type {
  FoundationIndex,
  TableauIndex,
} from "@caheinz2/solitaire-core";
import type { BoardCursor } from "./cursor.js";
import type { BoardView } from "./render-board.js";

export type Command = "enter" | "escape";

export type GameLike = {
  draw(): unknown;
  moveWasteToTableau(tableauIndex: TableauIndex): unknown;
  moveWasteToFoundation(foundationIndex: FoundationIndex): unknown;
  moveTableauToTableau(
    from: TableauIndex,
    to: TableauIndex,
    count: number,
  ): unknown;
  moveTableauToFoundation(
    tableauIndex: TableauIndex,
    foundationIndex: FoundationIndex,
  ): unknown;
  moveFoundationToTableau(
    foundationIndex: FoundationIndex,
    tableauIndex: TableauIndex,
  ): unknown;
};

export type Selection =
  | Readonly<{ kind: "waste" }>
  | Readonly<{ kind: "foundation"; foundationIndex: FoundationIndex }>
  | Readonly<{ kind: "tableau"; tableauIndex: TableauIndex; count: number }>;

export type AppState = Readonly<{
  cursor: BoardCursor;
  selection: Selection | null;
  status: string;
}>;

const topCardExists = <T>(cards: ReadonlyArray<T>): boolean => cards.length > 0;

const getSelection = (
  cursor: BoardCursor,
  board: BoardView,
): Selection | null => {
  if (cursor.kind === "waste") {
    return topCardExists(board.waste) ? { kind: "waste" } : null;
  }

  if (cursor.kind === "foundation") {
    const foundation = board.foundations[cursor.foundationIndex];

    return foundation && topCardExists(foundation.cards)
      ? { kind: "foundation", foundationIndex: cursor.foundationIndex }
      : null;
  }

  if (cursor.kind === "tableau" && cursor.cardIndex !== null) {
    const pile = board.tableau[cursor.tableauIndex];
    const card = pile?.[cursor.cardIndex];

    if (!pile || !card?.faceUp) {
      return null;
    }

    return {
      kind: "tableau",
      tableauIndex: cursor.tableauIndex,
      count: pile.length - cursor.cardIndex,
    };
  }

  return null;
};

const moveSelectionToTarget = (
  selection: Selection,
  cursor: BoardCursor,
  game: GameLike,
): string => {
  if (cursor.kind === "tableau") {
    if (selection.kind === "waste") {
      game.moveWasteToTableau(cursor.tableauIndex);
      return "Moved waste to tableau.";
    }

    if (selection.kind === "foundation") {
      game.moveFoundationToTableau(
        selection.foundationIndex,
        cursor.tableauIndex,
      );
      return "Moved foundation to tableau.";
    }

    game.moveTableauToTableau(
      selection.tableauIndex,
      cursor.tableauIndex,
      selection.count,
    );
    return "Moved tableau cards.";
  }

  if (cursor.kind === "foundation") {
    if (selection.kind === "waste") {
      game.moveWasteToFoundation(cursor.foundationIndex);
      return "Moved waste to foundation.";
    }

    if (selection.kind === "tableau" && selection.count === 1) {
      game.moveTableauToFoundation(
        selection.tableauIndex,
        cursor.foundationIndex,
      );
      return "Moved tableau to foundation.";
    }
  }

  return "Select a valid target.";
};

const handleEnter = (
  state: AppState,
  board: BoardView,
  game: GameLike,
): AppState => {
  if (state.cursor.kind === "stock" && !state.selection) {
    game.draw();
    return { ...state, selection: null, status: "Drew from stock." };
  }

  if (!state.selection) {
    const selection = getSelection(state.cursor, board);

    return selection
      ? { ...state, selection, status: `Selected ${selection.kind}.` }
      : { ...state, status: "Nothing selectable here." };
  }

  const status = moveSelectionToTarget(state.selection, state.cursor, game);

  return { ...state, selection: null, status };
};

export const handleCommand = (
  command: Command,
  state: AppState,
  board: BoardView,
  game: GameLike,
): AppState => {
  if (command === "escape") {
    return { ...state, selection: null, status: "Selection cleared." };
  }

  return handleEnter(state, board, game);
};
