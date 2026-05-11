#!/usr/bin/env node
import { emitKeypressEvents } from "node:readline";
import { Game } from "@caheinz2/solitaire-core";
import { SolitaireCliApp } from "./app.js";

const clearScreen = "\x1b[2J\x1b[H";

const game = Game.create();
const app = new SolitaireCliApp(game, {
  render(output) {
    process.stdout.write(`${clearScreen}${output}\n`);
  },
  exit() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    process.stdout.write("\n");
    process.exit(0);
  },
});

emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on("keypress", (_input, key) => {
  if (key.ctrl && key.name === "c") {
    process.exit(0);
  }

  app.handleKey(key.name ?? "");
});

app.start();
