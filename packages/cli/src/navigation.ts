import type { Cursor, GameView, TableauIndex } from "./types.js";

export type Direction = "up" | "down" | "left" | "right";

type HeaderColumn = 0 | 1 | 2 | 3 | 4 | 5;

export const getInitialCursor = (): Cursor => ({ area: "stock" });

export const moveCursor = (
  view: GameView,
  cursor: Cursor,
  direction: Direction,
): Cursor => {
  if (cursor.area === "tableau") {
    return moveTableauCursor(view, cursor, direction);
  }

  return moveHeaderCursor(view, cursor, direction);
};

export const normalizeCursor = (view: GameView, cursor: Cursor): Cursor => {
  if (cursor.area !== "tableau") {
    return cursor;
  }

  return {
    ...cursor,
    cardIndex: normalizeTableauCardIndex(
      view,
      cursor.tableauIndex,
      cursor.cardIndex,
    ),
  };
};

const moveHeaderCursor = (
  view: GameView,
  cursor: Exclude<Cursor, { area: "tableau" }>,
  direction: Direction,
): Cursor => {
  const column = getHeaderColumn(cursor);

  switch (direction) {
    case "left":
      return getHeaderCursor(Math.max(0, column - 1) as HeaderColumn);
    case "right":
      return getHeaderCursor(Math.min(5, column + 1) as HeaderColumn);
    case "down": {
      const tableauIndex = Math.min(column, 6) as TableauIndex;
      return {
        area: "tableau",
        tableauIndex,
        cardIndex: getDefaultTableauCardIndex(view, tableauIndex),
      };
    }
    case "up":
      return cursor;
  }
};

const moveTableauCursor = (
  view: GameView,
  cursor: Extract<Cursor, { area: "tableau" }>,
  direction: Direction,
): Cursor => {
  switch (direction) {
    case "left": {
      const tableauIndex = Math.max(0, cursor.tableauIndex - 1) as TableauIndex;
      return {
        area: "tableau",
        tableauIndex,
        cardIndex: getDefaultTableauCardIndex(view, tableauIndex),
      };
    }
    case "right": {
      const tableauIndex = Math.min(6, cursor.tableauIndex + 1) as TableauIndex;
      return {
        area: "tableau",
        tableauIndex,
        cardIndex: getDefaultTableauCardIndex(view, tableauIndex),
      };
    }
    case "up":
      if (cursor.cardIndex === null) {
        return getHeaderCursor(getNearestHeaderColumn(cursor.tableauIndex));
      }

      return normalizeCursor(view, {
        ...cursor,
        cardIndex: cursor.cardIndex - 1,
      });
    case "down":
      if (cursor.cardIndex === null) {
        return cursor;
      }

      return normalizeCursor(view, {
        ...cursor,
        cardIndex: cursor.cardIndex + 1,
      });
  }
};

const getHeaderColumn = (
  cursor: Exclude<Cursor, { area: "tableau" }>,
): HeaderColumn => {
  switch (cursor.area) {
    case "stock":
      return 0;
    case "waste":
      return 1;
    case "foundation":
      return (cursor.foundationIndex + 2) as HeaderColumn;
  }
};

const getHeaderCursor = (column: HeaderColumn): Cursor => {
  if (column === 0) {
    return { area: "stock" };
  }

  if (column === 1) {
    return { area: "waste" };
  }

  return {
    area: "foundation",
    foundationIndex: (column - 2) as 0 | 1 | 2 | 3,
  };
};

const getNearestHeaderColumn = (tableauIndex: TableauIndex): HeaderColumn =>
  Math.min(5, tableauIndex) as HeaderColumn;

const getDefaultTableauCardIndex = (
  view: GameView,
  tableauIndex: TableauIndex,
): number | null => {
  const pile = view.tableau[tableauIndex]!;

  for (let index = pile.length - 1; index >= 0; index -= 1) {
    if (pile[index]?.faceUp) {
      return index;
    }
  }

  return null;
};

const normalizeTableauCardIndex = (
  view: GameView,
  tableauIndex: TableauIndex,
  cardIndex: number | null,
): number | null => {
  const pile = view.tableau[tableauIndex]!;

  if (cardIndex === null || pile.length === 0) {
    return getDefaultTableauCardIndex(view, tableauIndex);
  }

  const clampedIndex = Math.max(0, Math.min(pile.length - 1, cardIndex));

  for (let index = clampedIndex; index < pile.length; index += 1) {
    if (pile[index]?.faceUp) {
      return index;
    }
  }

  for (let index = clampedIndex; index >= 0; index -= 1) {
    if (pile[index]?.faceUp) {
      return index;
    }
  }

  return null;
};
