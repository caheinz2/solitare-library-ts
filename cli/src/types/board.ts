import type {
  FoundationIndex,
  Foundations,
  Tableau,
  TableauIndex,
  Waste,
} from "@caheinz2/solitaire-core";
import type { Selection } from "./interaction.js";

export type BoardCursor =
  | Readonly<{ kind: "stock" }>
  | Readonly<{ kind: "waste" }>
  | Readonly<{ kind: "foundation"; foundationIndex: FoundationIndex }>
  | Readonly<{
      kind: "tableau";
      tableauIndex: TableauIndex;
      cardIndex: number | null;
    }>;

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
