# Frontend config

## Brand theme (`brand.ts`)

Logo path and color palette for SafNom. All UI reads CSS variables set from this file.

**Change colors:** edit `defaultBrandPalette` in [brand.ts](./brand.ts), or at runtime call `updatePalette()` from `useBrandTheme()` (persists to `localStorage` under `safnom-brand-overrides`).

**Change logo:** replace [public/brand/safnom-logo.jpg](../public/brand/safnom-logo.jpg) and update `brandLogo.src` if the filename changes.

Future: load palette from workspace settings API and call `setBrandTheme()` in `BrandThemeProvider`.
