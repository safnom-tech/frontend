# SafNom frontend brand

## Logo

File: [`public/brand/safnom-logo.jpg`](../public/brand/safnom-logo.jpg)

Used by [`components/SafnomLogo.tsx`](../components/SafnomLogo.tsx).

## Colors (dynamic theming)

**Primary source:** [`styles/brand-tokens.css`](../styles/brand-tokens.css)

Edit the `--safnom-color-*` variables to retheme buttons, gradients, links, and backgrounds site-wide.

**Runtime (optional):** set `NEXT_PUBLIC_SAFNOM_COLOR_*` in `.env.local` (see `.env.example`), or call `applyBrandColorsToDocument()` from [`lib/brand.ts`](../lib/brand.ts) (e.g. future admin theme UI).

**Defaults in code:** [`lib/brand.ts`](../lib/brand.ts) `defaultBrandColors` — keep aligned with CSS when changing the palette.
