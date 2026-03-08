import type { Rank, Suit } from './types/cards.js';
import type { TableauIndex } from './types/state.js';

export const SUITS: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

export const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const TABLEAU_INDICES: readonly TableauIndex[] = [0, 1, 2, 3, 4, 5, 6];
