import { handleCancel, handleEnter } from "../src/actions.js";
import type { CliState } from "../src/actions.js";
import {
  createCard,
  createFoundation,
  createFoundations,
  createGameWithState,
  createTableau,
} from "./test-setup.js";

describe("actions", () => {
  it("draws cards when entering on stock", () => {
    const game = createGameWithState({
      stock: [
        createCard("A", "clubs", false),
        createCard("2", "clubs", false),
        createCard("3", "clubs", false),
      ],
    });
    const state = createState(game, { area: "stock" });

    const nextState = handleEnter(state);

    expect(game.stock).toHaveLength(0);
    expect(game.waste).toEqual([
      createCard("3", "clubs"),
      createCard("2", "clubs"),
      createCard("A", "clubs"),
    ]);
    expect(nextState.status).toBe("Drew cards.");
  });

  it("selects and cancels the waste card", () => {
    const game = createGameWithState({
      waste: [createCard("A", "clubs")],
    });
    const selectedState = handleEnter(createState(game, { area: "waste" }));

    expect(selectedState.selection).toEqual({ source: "waste" });

    const canceledState = handleEnter(selectedState);

    expect(canceledState.selection).toBeNull();
    expect(canceledState.status).toBe("Selection canceled.");
  });

  it("moves waste to a selected foundation", () => {
    const game = createGameWithState({
      waste: [createCard("A", "clubs")],
    });
    const selectedState = handleEnter(createState(game, { area: "waste" }));
    const movedState = handleEnter({
      ...selectedState,
      cursor: { area: "foundation", foundationIndex: 0 },
    });

    expect(game.waste).toEqual([]);
    expect(game.foundations[0].cards).toEqual([createCard("A", "clubs")]);
    expect(movedState.selection).toBeNull();
    expect(movedState.status).toBe("Moved card.");
  });

  it("keeps selection when a move is invalid", () => {
    const game = createGameWithState({
      waste: [createCard("5", "clubs")],
    });
    const selectedState = handleEnter(createState(game, { area: "waste" }));
    const movedState = handleEnter({
      ...selectedState,
      cursor: { area: "foundation", foundationIndex: 0 },
    });

    expect(game.waste).toEqual([createCard("5", "clubs")]);
    expect(movedState.selection).toEqual({ source: "waste" });
    expect(movedState.status).toBe("Invalid move.");
  });

  it("moves a tableau run to another tableau pile", () => {
    const game = createGameWithState({
      tableau: createTableau({
        0: [
          createCard("9", "spades", false),
          createCard("7", "clubs"),
          createCard("6", "hearts"),
        ],
        1: [createCard("8", "diamonds")],
      }),
    });
    const selectedState = handleEnter(
      createState(game, {
        area: "tableau",
        tableauIndex: 0,
        cardIndex: 1,
      }),
    );
    const movedState = handleEnter({
      ...selectedState,
      cursor: { area: "tableau", tableauIndex: 1, cardIndex: 0 },
    });

    expect(game.tableau[0]).toEqual([createCard("9", "spades")]);
    expect(game.tableau[1]).toEqual([
      createCard("8", "diamonds"),
      createCard("7", "clubs"),
      createCard("6", "hearts"),
    ]);
    expect(movedState.status).toBe("Moved cards.");
  });

  it("moves a foundation card to tableau", () => {
    const game = createGameWithState({
      foundations: createFoundations({
        0: createFoundation("clubs", [createCard("K", "clubs")]),
      }),
    });
    const selectedState = handleEnter(
      createState(game, { area: "foundation", foundationIndex: 0 }),
    );
    const movedState = handleEnter({
      ...selectedState,
      cursor: { area: "tableau", tableauIndex: 0, cardIndex: null },
    });

    expect(game.foundations[0].cards).toEqual([]);
    expect(game.tableau[0]).toEqual([createCard("K", "clubs")]);
    expect(movedState.status).toBe("Moved card.");
  });

  it("cancels selection on escape", () => {
    const game = createGameWithState({ waste: [createCard("A", "clubs")] });
    const state = createState(game, { area: "waste" });

    expect(handleCancel({ ...state, selection: { source: "waste" } })).toEqual({
      ...state,
      selection: null,
      status: "Selection canceled.",
    });
  });
});

const createState = (
  game: CliState["game"],
  cursor: CliState["cursor"],
): CliState => ({
  game,
  cursor,
  selection: null,
  status: "",
});
