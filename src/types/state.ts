import type { Card } from './cards.js';

export type Stock = ReadonlyArray<Card>;
export type Waste = ReadonlyArray<Card>;
export type Foundation = ReadonlyArray<Card>;
export type TableauPile = ReadonlyArray<Card>;

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

export interface GameState {
  readonly stock: Stock;
  readonly waste: Waste;
  readonly foundations: Foundations;
  readonly tableau: Tableau;
}
