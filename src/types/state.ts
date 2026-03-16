import type { Card, Suit } from './cards.js';

export type Stack<T> = ReadonlyArray<T>;

export type Stock = Stack<Card>;
export type Waste = Stack<Card>;
export type Foundation = Readonly<{
  suit: Suit | null;
  cards: Stack<Card>;
}>;
export type TableauPile = Stack<Card>;

export type Foundations = readonly [Foundation, Foundation, Foundation, Foundation];
export type Tableau = readonly [
  TableauPile,
  TableauPile,
  TableauPile,
  TableauPile,
  TableauPile,
  TableauPile,
  TableauPile
];

export type FoundationIndex = 0 | 1 | 2 | 3;
export type TableauIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type GameState = {
  readonly stock: Stock;
  readonly waste: Waste;
  readonly foundations: Foundations;
  readonly tableau: Tableau;
};
