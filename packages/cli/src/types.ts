import type {
  Card,
  Foundation,
  Foundations,
  FoundationIndex,
  GameState,
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
  FoundationIndex,
  Foundations,
  GameState,
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
  foundationIndex: FoundationIndex;
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
      foundationIndex: FoundationIndex;
    }>
  | Readonly<{
      source: "tableau";
      tableauIndex: TableauIndex;
      cardIndex: number;
    }>;
