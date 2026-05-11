import type {
  FoundationIndex,
  Game,
  TableauIndex,
} from "@caheinz2/solitaire-core";
import type { BoardView } from "./board.js";

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

export type PlayableGame = GameCommands & Pick<Game, "isWon">;

export type RenderSink = {
  render(output: string): void;
  exit(): void;
};

export type BoardProvider = () => BoardView;
