import { stdin as defaultInput, stdout as defaultOutput } from "node:process";
import readline from "node:readline";
import { Game } from "solitaire-library-ts";
import { handleCancel, handleEnter, getGameView } from "./actions.js";
import type { CliState } from "./actions.js";
import { getInitialCursor, moveCursor } from "./navigation.js";
import type { Direction } from "./navigation.js";
import { renderBoard } from "./renderer.js";

type InputStream = NodeJS.ReadStream & {
  setRawMode?: (mode: boolean) => void;
};

type OutputStream = NodeJS.WriteStream;

type KeyPress = Readonly<{
  ctrl?: boolean;
  name?: string;
  sequence?: string;
}>;

export type RunCliOptions = Readonly<{
  input?: InputStream;
  output?: OutputStream;
  rng?: () => number;
}>;

export const runCli = ({
  input = defaultInput,
  output = defaultOutput,
  rng,
}: RunCliOptions = {}): void => {
  if (!input.isTTY) {
    output.write("Solitaire CLI requires an interactive TTY.\n");
    return;
  }

  const game = rng ? Game.create({ rng }) : Game.create();
  let state: CliState = {
    game,
    cursor: getInitialCursor(),
    selection: null,
    status: "Ready.",
  };

  const render = (): void => {
    output.write("\x1b[2J\x1b[H");
    output.write(
      renderBoard({
        view: getGameView(state.game),
        cursor: state.cursor,
        selection: state.selection,
        status: state.status,
      }),
    );
    output.write("\n");
  };

  const cleanup = (): void => {
    input.off("keypress", onKeyPress);
    input.setRawMode?.(false);
    input.pause();
    output.write("\n");
  };

  const onKeyPress = (_value: string, key: KeyPress): void => {
    if (key.ctrl && key.name === "c") {
      cleanup();
      return;
    }

    if (key.name === "q") {
      cleanup();
      return;
    }

    if (isDirection(key.name)) {
      state = {
        ...state,
        cursor: moveCursor(getGameView(state.game), state.cursor, key.name),
      };
      render();
      return;
    }

    if (key.name === "return" || key.name === "enter") {
      state = handleEnter(state);
      render();
      return;
    }

    if (key.name === "escape") {
      state = handleCancel(state);
      render();
    }
  };

  readline.emitKeypressEvents(input);
  input.setRawMode?.(true);
  input.resume();
  input.on("keypress", onKeyPress);
  render();
};

const isDirection = (name: string | undefined): name is Direction =>
  name === "up" || name === "down" || name === "left" || name === "right";
