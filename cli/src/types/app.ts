import { BoardCursor } from "./board.js";
import { Selection } from "./interaction.js";

export type RenderSink = {
  render(output: string): void;
  exit(): void;
};

export type AppState = Readonly<{
  cursor: BoardCursor;
  selection: Selection | null;
  status: string;
}>;
