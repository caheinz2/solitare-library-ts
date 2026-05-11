export type CardSuit = "clubs" | "diamonds" | "hearts" | "spades";
export type CardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type CardView = Readonly<{
  rank: CardRank;
  suit: CardSuit;
  faceUp: boolean;
}>;

export type FoundationView = Readonly<{
  suit: CardSuit | null;
  cards: ReadonlyArray<CardView>;
}>;

export type BoardView = Readonly<{
  stockCount: number;
  waste: ReadonlyArray<CardView>;
  foundations: readonly [
    FoundationView,
    FoundationView,
    FoundationView,
    FoundationView,
  ];
  tableau: readonly [
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
    ReadonlyArray<CardView>,
  ];
}>;

const columnWidth = 10;

const suitLabels: Record<CardSuit, string> = {
  clubs: "C",
  diamonds: "D",
  hearts: "H",
  spades: "S",
};

const topCard = <T>(cards: ReadonlyArray<T>): T | undefined =>
  cards[cards.length - 1];

const renderCard = (card: CardView | undefined): string => {
  if (!card) {
    return "[ ]";
  }

  if (!card.faceUp) {
    return "##";
  }

  return `${card.rank}${suitLabels[card.suit]}`;
};

const renderStock = (stockCount: number): string =>
  `Stock: ${stockCount > 0 ? "[##]" : "[ ]"} ${stockCount}`;

const renderWaste = (waste: ReadonlyArray<CardView>): string =>
  `Waste: ${renderCard(topCard(waste))} (${waste.length})`;

const renderFoundations = (
  foundations: BoardView["foundations"],
): string =>
  `Foundations: ${foundations
    .map((foundation) => renderCard(topCard(foundation.cards)))
    .join(" ")}`;

const renderTableauRows = (tableau: BoardView["tableau"]): string[] => {
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
        .map((pile) => (pile[rowIndex] ? renderCard(pile[rowIndex]) : ""))
        .map((cell) => cell.padEnd(columnWidth, " "))
        .join("")
        .trimEnd(),
    );
  }

  return rows;
};

export const renderBoard = (board: BoardView): string =>
  [
    `${renderStock(board.stockCount)}   ${renderWaste(board.waste)}   ${renderFoundations(
      board.foundations,
    )}`,
    "",
    ...renderTableauRows(board.tableau),
  ].join("\n");
