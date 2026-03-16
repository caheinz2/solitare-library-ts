import type { Card, Suit } from './cards.js';

export type Stack<T> = T[];

export type Stock = Stack<Card>;
export type Waste = Stack<Card>;
export type Foundation = {
  suit: Suit | null;
  cards: Stack<Card>;
};
export type TableauPile = Stack<Card>;

export type Foundations = [Foundation, Foundation, Foundation, Foundation];
export type Tableau = [
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
  stock: Stock;
  waste: Waste;
  foundations: Foundations;
  tableau: Tableau;
};
