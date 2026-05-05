# solitaire-library-ts

TypeScript packages for Solitaire (draw-3).

## Packages

- `packages/core` - TypeScript library published as `solitaire-library-ts`
- `packages/cli` - terminal app published as `solitaire-library-ts-cli`

## Scripts

- `npm test` - run workspace unit tests
- `npm run test:watch` - watch core library tests
- `npm run build` - build workspace packages

## CLI

The repository includes a terminal Solitaire app in `packages/cli`.

- `npm run build`
- `npm run build --workspace solitaire-library-ts-cli`
- `npm run start --workspace solitaire-library-ts-cli`

Controls:

- Arrow keys move the cursor.
- Enter selects cards, moves selected cards, or draws from stock.
- Esc cancels the current selection.
- `q` quits.
