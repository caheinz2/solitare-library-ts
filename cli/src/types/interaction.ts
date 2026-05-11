import type {
  FoundationIndex,
  Game,
  TableauIndex,
} from "@caheinz2/solitaire-core";
import type { BoardCursor } from "./board.js";

export type Direction = "up" | "down" | "left" | "right";

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

export type PlayableGame = GameCommands &
  Pick<Game, "isWon" | "stock" | "waste" | "foundations" | "tableau">;
