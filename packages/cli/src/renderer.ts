import type { Card } from "solitaire-library-ts";
import type { Cursor, GameView, Selection } from "./types.js";

export type RenderBoardOptions = Readonly<{
  view: GameView;
  cursor: Cursor;
  selection: Selection | null;
  status: string;
}>;

const CELL_WIDTH = 6;

export const renderBoard = ({
  view,
  cursor,
  selection,
  status,
}: RenderBoardOptions): string => {
  const lines = [
    "Solitaire",
    "",
    renderHeader(view, cursor, selection),
    "",
    renderTableau(view, cursor, selection),
    "",
    status,
  ];

  if (view.isWon) {
    lines.push("You won!");
  }

  lines.push("Arrows move  Enter selects/moves  Esc cancels  q quits");

  return lines.filter((line) => line.length > 0).join("\n");
};

const renderHeader = (
  view: GameView,
  cursor: Cursor,
  selection: Selection | null,
): string => {
  const stock = renderSelectableCard({
    label: "Stock",
    card: view.stock.length > 0 ? "face-down" : null,
    isCursor: cursor.area === "stock",
    isSelected: false,
  });
  const waste = renderSelectableCard({
    label: "Waste",
    card: view.waste.at(-1) ?? null,
    isCursor: cursor.area === "waste",
    isSelected: selection?.source === "waste",
  });
  const foundations = view.foundations.map((foundation, foundationIndex) =>
    renderSelectableCard({
      label: `F${foundationIndex + 1}`,
      card: foundation.cards.at(-1) ?? null,
      isCursor:
        cursor.area === "foundation" &&
        cursor.foundationIndex === foundationIndex,
      isSelected:
        selection?.source === "foundation" &&
        selection.foundationIndex === foundationIndex,
    }),
  );

  return [stock, waste, ...foundations].join("  ");
};

const renderTableau = (
  view: GameView,
  cursor: Cursor,
  selection: Selection | null,
): string => {
  const labels = view.tableau.map((_, tableauIndex) => {
    const label = `T${tableauIndex + 1}`;
    const isEmptyCursor =
      cursor.area === "tableau" &&
      cursor.tableauIndex === tableauIndex &&
      cursor.cardIndex === null;

    return padCell(isEmptyCursor ? `>${label}<` : ` ${label} `);
  });
  const maxPileLength = Math.max(
    1,
    ...view.tableau.map((pile) => pile.length),
  );
  const rows = [labels.join(" ")];

  for (let rowIndex = 0; rowIndex < maxPileLength; rowIndex += 1) {
    rows.push(
      view.tableau
        .map((pile, tableauIndex) => {
          const card = pile[rowIndex] ?? null;
          const isCursor =
            cursor.area === "tableau" &&
            cursor.tableauIndex === tableauIndex &&
            cursor.cardIndex === rowIndex;
          const isSelected =
            selection?.source === "tableau" &&
            selection.tableauIndex === tableauIndex &&
            selection.cardIndex === rowIndex;

          return padCell(
            renderCardMarker(card, {
              isCursor,
              isSelected,
            }),
          );
        })
        .join(" "),
    );
  }

  return rows.join("\n");
};

const renderSelectableCard = ({
  label,
  card,
  isCursor,
  isSelected,
}: Readonly<{
  label: string;
  card: Card | "face-down" | null;
  isCursor: boolean;
  isSelected: boolean;
}>): string => {
  const selectedLabel = isSelected ? `*${label}` : label;

  return `${selectedLabel} ${renderCardMarker(card, { isCursor, isSelected })}`;
};

const renderCardMarker = (
  card: Card | "face-down" | null,
  {
    isCursor,
    isSelected,
  }: Readonly<{ isCursor: boolean; isSelected: boolean }>,
): string => {
  const cardText = renderCard(card);

  if (isCursor) {
    return `>${cardText}<`;
  }

  if (isSelected) {
    return `*${cardText}`;
  }

  return cardText;
};

const renderCard = (card: Card | "face-down" | null): string => {
  if (card === null) {
    return "[  ]";
  }

  if (card === "face-down" || !card.faceUp) {
    return "[##]";
  }

  return `[${card.rank}${getSuitLabel(card.suit)}]`;
};

const getSuitLabel = (suit: Card["suit"]): string => {
  switch (suit) {
    case "clubs":
      return "C";
    case "diamonds":
      return "D";
    case "hearts":
      return "H";
    case "spades":
      return "S";
  }
};

const padCell = (value: string): string => value.padEnd(CELL_WIDTH, " ");
