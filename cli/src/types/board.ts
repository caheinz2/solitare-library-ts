import type {
  Foundations,
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
