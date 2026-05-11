import type { GameCommands } from "./commands.js";
import type { BoardView } from "./board.js";

export type PlayableGame = GameCommands & Readonly<{ isWon: boolean }>;

export type RenderSink = {
  render(output: string): void;
  exit(): void;
};

export type BoardProvider = () => BoardView;
