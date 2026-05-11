import type { TableauIndex } from "@caheinz2/solitaire-core";
import type { BoardCursor, BoardView, Direction } from "./types/index.js";

const topRow: ReadonlyArray<BoardCursor> = [
  { kind: "stock" },
  { kind: "waste" },
  { kind: "foundation", foundationIndex: 0 },
  { kind: "foundation", foundationIndex: 1 },
  { kind: "foundation", foundationIndex: 2 },
  { kind: "foundation", foundationIndex: 3 },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toTableauIndex = (value: number): TableauIndex =>
  clamp(value, 0, 6) as TableauIndex;

const topRowIndex = (cursor: BoardCursor): number => {
  if (cursor.kind === "stock") {
    return 0;
  }

  if (cursor.kind === "waste") {
    return 1;
  }

  if (cursor.kind === "foundation") {
    return cursor.foundationIndex + 2;
  }

  return clamp(cursor.tableauIndex, 0, topRow.length - 1);
};

const topRowCursor = (index: number): BoardCursor =>
  topRow[clamp(index, 0, topRow.length - 1)] ?? { kind: "stock" };

const tableauCursor = (
  board: BoardView,
  tableauIndex: number,
  preferredCardIndex: number | null,
): BoardCursor => {
  const safeTableauIndex = toTableauIndex(tableauIndex);
  const pile = board.tableau[safeTableauIndex];

  if (!pile) {
    return { kind: "tableau", tableauIndex: safeTableauIndex, cardIndex: null };
  }

  if (preferredCardIndex !== null && pile[preferredCardIndex]?.faceUp) {
    return {
      kind: "tableau",
      tableauIndex: safeTableauIndex,
      cardIndex: preferredCardIndex,
    };
  }

  const firstFaceUpIndex = pile.findIndex((card) => card.faceUp);

  return {
    kind: "tableau",
    tableauIndex: safeTableauIndex,
    cardIndex: firstFaceUpIndex === -1 ? null : firstFaceUpIndex,
  };
};

const moveHorizontal = (
  cursor: BoardCursor,
  direction: "left" | "right",
  board: BoardView,
): BoardCursor => {
  const delta = direction === "left" ? -1 : 1;

  if (cursor.kind === "tableau") {
    return tableauCursor(
      board,
      clamp(cursor.tableauIndex + delta, 0, board.tableau.length - 1),
      cursor.cardIndex,
    );
  }

  return topRowCursor(topRowIndex(cursor) + delta);
};

const moveVerticalInTableau = (
  cursor: Extract<BoardCursor, { kind: "tableau" }>,
  direction: "up" | "down",
  board: BoardView,
): BoardCursor => {
  const pile = board.tableau[cursor.tableauIndex];

  if (!pile || cursor.cardIndex === null) {
    return direction === "up" ? topRowCursor(topRowIndex(cursor)) : cursor;
  }

  const delta = direction === "up" ? -1 : 1;
  const nextIndex = cursor.cardIndex + delta;

  if (pile[nextIndex]?.faceUp) {
    return { ...cursor, cardIndex: nextIndex };
  }

  return direction === "up" ? topRowCursor(topRowIndex(cursor)) : cursor;
};

export const moveCursor = (
  cursor: BoardCursor,
  direction: Direction,
  board: BoardView,
): BoardCursor => {
  if (direction === "left" || direction === "right") {
    return moveHorizontal(cursor, direction, board);
  }

  if (cursor.kind === "tableau") {
    return moveVerticalInTableau(cursor, direction, board);
  }

  if (direction === "down") {
    return tableauCursor(board, topRowIndex(cursor), null);
  }

  return cursor;
};
