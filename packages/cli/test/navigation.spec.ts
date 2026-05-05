import {
  getInitialNavigationState,
  getInitialCursor,
  moveCursor,
  moveNavigation,
  normalizeCursor,
} from "../src/navigation.js";
import {
  createCard,
  createGameView,
  createTableau,
} from "./test-setup.js";

describe("navigation", () => {
  it("starts on the stock", () => {
    expect(getInitialCursor()).toEqual({ area: "stock" });
  });

  it("moves across the header and clamps at both ends", () => {
    const view = createGameView();

    expect(moveCursor(view, { area: "stock" }, "left")).toEqual({
      area: "stock",
    });
    expect(moveCursor(view, { area: "stock" }, "right")).toEqual({
      area: "waste",
    });
    expect(moveCursor(view, { area: "foundation", foundationIndex: 3 }, "right"))
      .toEqual({
        area: "foundation",
        foundationIndex: 3,
      });
  });

  it("moves between header and tableau by nearest column", () => {
    const view = createGameView({
      tableau: createTableau({ 0: [], 2: [createCard("A", "clubs")] }),
    });

    expect(moveCursor(view, { area: "foundation", foundationIndex: 0 }, "down"))
      .toEqual({
        area: "tableau",
        tableauIndex: 2,
        cardIndex: 0,
      });
    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 0, cardIndex: null },
        "up",
      ),
    ).toEqual({ area: "stock" });
  });

  it("moves left and right across tableau piles", () => {
    const view = createGameView({
      tableau: createTableau({
        0: [createCard("K", "clubs")],
        1: [createCard("Q", "hearts")],
      }),
    });

    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 0, cardIndex: 0 },
        "right",
      ),
    ).toEqual({ area: "tableau", tableauIndex: 1, cardIndex: 0 });
    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 0, cardIndex: 0 },
        "left",
      ),
    ).toEqual({ area: "tableau", tableauIndex: 0, cardIndex: 0 });
  });

  it("moves up and down within visible tableau cards", () => {
    const view = createGameView({
      tableau: createTableau({
        0: [
          createCard("9", "clubs", false),
          createCard("8", "diamonds"),
          createCard("7", "clubs"),
        ],
      }),
    });

    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 0, cardIndex: 2 },
        "up",
      ),
    ).toEqual({ area: "tableau", tableauIndex: 0, cardIndex: 1 });
    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 0, cardIndex: 1 },
        "down",
      ),
    ).toEqual({ area: "tableau", tableauIndex: 0, cardIndex: 2 });
  });

  it("moves from the first visible tableau card back to the header", () => {
    const view = createGameView({
      tableau: createTableau({
        2: [
          createCard("9", "clubs", false),
          createCard("8", "diamonds"),
          createCard("7", "clubs"),
        ],
      }),
    });

    expect(
      moveCursor(
        view,
        { area: "tableau", tableauIndex: 2, cardIndex: 1 },
        "up",
      ),
    ).toEqual({ area: "foundation", foundationIndex: 0 });
  });

  it("normalizes tableau cursors to selectable face-up cards or empty piles", () => {
    const view = createGameView({
      tableau: createTableau({
        0: [createCard("9", "clubs", false), createCard("8", "diamonds")],
        1: [createCard("7", "clubs", false)],
      }),
    });

    expect(
      normalizeCursor(view, {
        area: "tableau",
        tableauIndex: 0,
        cardIndex: 0,
      }),
    ).toEqual({ area: "tableau", tableauIndex: 0, cardIndex: 1 });
    expect(
      normalizeCursor(view, {
        area: "tableau",
        tableauIndex: 1,
        cardIndex: 0,
      }),
    ).toEqual({ area: "tableau", tableauIndex: 1, cardIndex: null });
  });

  it("remembers header and tableau cursor positions independently", () => {
    const view = createGameView({
      tableau: createTableau({
        0: [createCard("K", "clubs")],
        4: [createCard("Q", "hearts")],
      }),
    });

    let navigation = getInitialNavigationState();

    navigation = moveNavigation(view, navigation, "down");
    navigation = moveNavigation(view, navigation, "right");
    navigation = moveNavigation(view, navigation, "right");
    navigation = moveNavigation(view, navigation, "right");
    navigation = moveNavigation(view, navigation, "right");

    expect(navigation.cursor).toEqual({
      area: "tableau",
      tableauIndex: 4,
      cardIndex: 0,
    });

    navigation = moveNavigation(view, navigation, "up");
    navigation = moveNavigation(view, navigation, "right");

    expect(navigation.cursor).toEqual({ area: "waste" });

    navigation = moveNavigation(view, navigation, "down");

    expect(navigation.cursor).toEqual({
      area: "tableau",
      tableauIndex: 4,
      cardIndex: 0,
    });

    navigation = moveNavigation(view, navigation, "up");

    expect(navigation.cursor).toEqual({ area: "waste" });
  });
});
