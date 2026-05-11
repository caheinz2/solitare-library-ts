import type { Card, Foundations, Rank, Suit } from "../../src/index.js";
import { areFoundationsComplete } from "../../src/utils/foundation-ops.js";

const ranks: ReadonlyArray<Rank> = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const createCompleteFoundationCards = (suit: Suit): Card[] =>
  ranks.map((rank) => ({ suit, rank, faceUp: true }));

describe("areFoundationsComplete", () => {
  it("returns true when all foundations contain 13 cards", () => {
    const foundations: Foundations = [
      { suit: "clubs", cards: createCompleteFoundationCards("clubs") },
      { suit: "diamonds", cards: createCompleteFoundationCards("diamonds") },
      { suit: "hearts", cards: createCompleteFoundationCards("hearts") },
      { suit: "spades", cards: createCompleteFoundationCards("spades") },
    ];

    expect(areFoundationsComplete(foundations)).toBe(true);
  });

  it("returns false when any foundation is incomplete", () => {
    const foundations: Foundations = [
      { suit: "clubs", cards: createCompleteFoundationCards("clubs") },
      { suit: "diamonds", cards: createCompleteFoundationCards("diamonds") },
      { suit: "hearts", cards: createCompleteFoundationCards("hearts") },
      {
        suit: "spades",
        cards: createCompleteFoundationCards("spades").slice(1),
      },
    ];

    expect(areFoundationsComplete(foundations)).toBe(false);
  });
});
