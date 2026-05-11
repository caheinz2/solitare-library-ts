import type {
  Card,
  Foundations,
  Suit,
  Tableau,
  Waste,
} from "@caheinz2/solitaire-core";
import type { Selection } from "./commands.js";
import type { BoardCursor } from "./cursor.js";

export type BoardView = Readonly<{
  stockCount: number;
  waste: Waste;
  foundations: Foundations;
  tableau: Tableau;
}>;

export type RenderOptions = Readonly<{
  cursor?: BoardCursor;
  selection?: Selection | null;
}>;

const columnWidth = 10;

const suitLabels: Record<Suit, string> = {
  clubs: "C",
  diamonds: "D",
  hearts: "H",
  spades: "S",
};

const topCard = <T>(cards: ReadonlyArray<T>): T | undefined =>
  cards[cards.length - 1];

const renderCard = (card: Card | undefined): string => {
  if (!card) {
    return "[ ]";
  }

  if (!card.faceUp) {
    return "##";
  }

  return `${card.rank}${suitLabels[card.suit]}`;
};

const markCursor = (value: string, active: boolean): string =>
  active ? `>${value}<` : value;

const markSelection = (value: string, active: boolean): string =>
  active ? `{${value}}` : value;

const renderStock = (
  stockCount: number,
  options: RenderOptions,
): string => {
  const stock = stockCount > 0 ? "[##]" : "[ ]";

  return `Stock: ${markCursor(stock, options.cursor?.kind === "stock")} ${stockCount}`;
};

const renderWaste = (
  waste: Waste,
  options: RenderOptions,
): string => {
  const wasteCard = markCursor(
    markSelection(renderCard(topCard(waste)), options.selection?.kind === "waste"),
    options.cursor?.kind === "waste",
  );

  return `Waste: ${wasteCard} (${waste.length})`;
};

const renderFoundations = (
  foundations: BoardView["foundations"],
  options: RenderOptions,
): string =>
  `Foundations: ${foundations
    .map((foundation, foundationIndex) =>
      markCursor(
        markSelection(
          renderCard(topCard(foundation.cards)),
          options.selection?.kind === "foundation" &&
            options.selection.foundationIndex === foundationIndex,
        ),
        options.cursor?.kind === "foundation" &&
          options.cursor.foundationIndex === foundationIndex,
      ),
    )
    .join(" ")}`;

const renderTableauCell = (
  board: BoardView,
  tableauIndex: number,
  cardIndex: number,
  options: RenderOptions,
): string => {
  const pile = board.tableau[tableauIndex];
  const card = pile?.[cardIndex];

  if (!pile || !card) {
    return "";
  }

  const selectionStart =
    options.selection?.kind === "tableau" &&
    options.selection.tableauIndex === tableauIndex
      ? pile.length - options.selection.count
      : null;

  return markCursor(
    markSelection(renderCard(card), selectionStart === cardIndex),
    options.cursor?.kind === "tableau" &&
      options.cursor.tableauIndex === tableauIndex &&
      options.cursor.cardIndex === cardIndex,
  );
};

const renderTableauRows = (
  board: BoardView,
  options: RenderOptions,
): string[] => {
  const { tableau } = board;
  const rowCount = Math.max(0, ...tableau.map((pile) => pile.length));
  const rows: string[] = [
    ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]
      .map((label) => label.padEnd(columnWidth, " "))
      .join("")
      .trimEnd(),
  ];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows.push(
      tableau
        .map((_pile, tableauIndex) =>
          renderTableauCell(board, tableauIndex, rowIndex, options),
        )
        .map((cell) => cell.padEnd(columnWidth, " "))
        .join("")
        .trimEnd(),
    );
  }

  return rows;
};

export const renderBoard = (
  board: BoardView,
  options: RenderOptions = {},
): string =>
  [
    `${renderStock(board.stockCount, options)}   ${renderWaste(
      board.waste,
      options,
    )}   ${renderFoundations(
      board.foundations,
      options,
    )}`,
    "",
    ...renderTableauRows(board, options),
  ].join("\n");
