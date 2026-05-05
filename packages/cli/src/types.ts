import type {
  Card,
  Foundation,
  Foundations,
  Rank,
  Stock,
  Suit,
  Tableau,
  TableauIndex,
  Waste,
} from "solitaire-library-ts";

export type {
  Card,
  Foundation,
  Foundations,
  Rank,
  Suit,
  Tableau,
  TableauIndex,
};

export type GameView = Readonly<{
  stock: Stock;
  waste: Waste;
  foundations: Foundations;
  tableau: Tableau;
  isWon: boolean;
}>;

export type StockCursor = Readonly<{
  area: "stock";
}>;

export type WasteCursor = Readonly<{
  area: "waste";
}>;

export type FoundationCursor = Readonly<{
  area: "foundation";
  foundationIndex: 0 | 1 | 2 | 3;
}>;

export type TableauCursor = Readonly<{
  area: "tableau";
  tableauIndex: TableauIndex;
  cardIndex: number | null;
}>;

export type Cursor =
  | StockCursor
  | WasteCursor
  | FoundationCursor
  | TableauCursor;

export type Selection =
  | Readonly<{
      source: "waste";
    }>
  | Readonly<{
      source: "foundation";
      foundationIndex: 0 | 1 | 2 | 3;
    }>
  | Readonly<{
      source: "tableau";
      tableauIndex: TableauIndex;
      cardIndex: number;
    }>;
