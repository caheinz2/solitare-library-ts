import { handleCommand } from "./commands.js";
import { moveCursor } from "./cursor.js";
import { createBoardView } from "./board-from-game.js";
import { renderBoard } from "./render-board.js";
import type {
  AppState,
  Direction,
  PlayableGame,
  RenderSink,
} from "./types/index.js";

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
    private readonly sink: RenderSink,
  ) {}

  public start(): void {
    this.render();
  }

  public handleKey(keyName: string): void {
    if (keyName === "escape") {
      this.applyEscapeCommand();
    } else if (keyName === "q" || keyName === "c") {
      this.applyExitCommand();
    } else if (keyName === "return" || keyName === "enter") {
      this.applyEnterCommand();
    } else {
      this.applyMoveCursorCommand(keyName);
    }
  }

  private applyEnterCommand(): void {
    this.state = handleCommand(
      "enter",
      this.state,
      createBoardView(this.game),
      this.game,
    );
    this.render();
  }

  private applyEscapeCommand(): void {
    this.state = handleCommand(
      "escape",
      this.state,
      createBoardView(this.game),
      this.game,
    );
    this.render();
  }

  private applyExitCommand(): void {
    this.sink.exit();
  }

  private applyMoveCursorCommand(keyName: string): void {
    const direction = directionKeys[keyName];

    if (direction) {
      this.state = {
        ...this.state,
        cursor: moveCursor(
          this.state.cursor,
          direction,
          createBoardView(this.game),
        ),
      };
      this.render();
    }
  }

  private render(): void {
    const board = renderBoard(createBoardView(this.game), {
      cursor: this.state.cursor,
      selection: this.state.selection,
    });
    const status = this.game.isWon ? "You won!" : this.state.status;
    const help = "Arrows move | Enter selects/draws/moves | Esc clears | q quits";
    const footer = status ? `\n\n${status}\n${help}` : `\n\n${help}`;

    this.sink.render(`${board}${footer}`);
  }
}
