import type {
  FoundationIndex,
  TableauIndex,
} from "@caheinz2/solitaire-core";

export type Direction = "up" | "down" | "left" | "right";

export type BoardCursor =
  | Readonly<{ kind: "stock" }>
  | Readonly<{ kind: "waste" }>
  | Readonly<{ kind: "foundation"; foundationIndex: FoundationIndex }>
  | Readonly<{
      kind: "tableau";
      tableauIndex: TableauIndex;
      cardIndex: number | null;
    }>;
