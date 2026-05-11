import type {
  FoundationIndex,
  Game,
  TableauIndex,
} from "@caheinz2/solitaire-core";
import type { BoardCursor } from "./cursor.js";

export type Command = "enter" | "escape";

export type GameCommands = Pick<
  Game,
  | "draw"
  | "moveWasteToTableau"
  | "moveWasteToFoundation"
  | "moveTableauToTableau"
  | "moveTableauToFoundation"
  | "moveFoundationToTableau"
>;

export type Selection =
  | Readonly<{ kind: "waste" }>
  | Readonly<{ kind: "foundation"; foundationIndex: FoundationIndex }>
  | Readonly<{ kind: "tableau"; tableauIndex: TableauIndex; count: number }>;

export type AppState = Readonly<{
  cursor: BoardCursor;
  selection: Selection | null;
  status: string;
}>;
