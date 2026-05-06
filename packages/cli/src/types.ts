import type {
  FoundationIndex,
  GameState,
  TableauIndex,
} from "solitaire-library-ts";

export type GameView = Readonly<GameState & {
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
