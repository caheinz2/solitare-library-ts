import { handleCommand, type AppState, type GameLike } from "./commands.js";
import { moveCursor, type Direction } from "./cursor.js";
import { renderBoard, type BoardView } from "./render-board.js";

export type PlayableGame = GameLike & Readonly<{ isWon: boolean }>;

export type RenderSink = {
  render(output: string): void;
  exit(): void;
};

export type BoardProvider = () => BoardView;

const initialState: AppState = {
  cursor: { kind: "stock" },
  selection: null,
  status: "",
};

const directionKeys: Readonly<Record<string, Direction>> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

export class SolitaireCliApp {
  private state: AppState = initialState;

  public constructor(
    private readonly game: PlayableGame,
    private readonly getBoard: BoardProvider,
    private readonly sink: RenderSink,
  ) {}

  public start(): void {
    this.render();
  }

  public handleKey(keyName: string): void {
    if (keyName === "q" || keyName === "c" || keyName === "escape") {
      if (keyName === "escape") {
        this.applyCommand("escape");
        return;
      }

      this.sink.exit();
      return;
    }

    if (keyName === "return" || keyName === "enter") {
      this.applyCommand("enter");
      return;
    }

    const direction = directionKeys[keyName];

    if (direction) {
      this.state = {
        ...this.state,
        cursor: moveCursor(this.state.cursor, direction, this.getBoard()),
      };
      this.render();
    }
  }

  private applyCommand(command: "enter" | "escape"): void {
    this.state = handleCommand(
      command,
      this.state,
      this.getBoard(),
      this.game,
    );
    this.render();
  }

  private render(): void {
    const board = renderBoard(this.getBoard(), {
      cursor: this.state.cursor,
      selection: this.state.selection,
    });
    const status = this.game.isWon ? "You won!" : this.state.status;
    const help = "Arrows move | Enter selects/draws/moves | Esc clears | q quits";
    const footer = status ? `\n\n${status}\n${help}` : `\n\n${help}`;

    this.sink.render(`${board}${footer}`);
  }
}
