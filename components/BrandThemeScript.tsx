import { defaultBrandPalette } from "@/config/brand";

/** Inline brand CSS vars before paint (matches config/brand.ts defaults). */
export function BrandThemeScript() {
  const p = defaultBrandPalette;
  const script = `(function(){try{var r=document.documentElement;var p=${JSON.stringify(p)};r.style.setProperty('--brand-deep',p.deep);r.style.setProperty('--brand',p.primary);r.style.setProperty('--brand-light',p.light);r.style.setProperty('--accent-soft',p.glow);r.style.setProperty('--accent',p.primary);r.style.setProperty('--brand-canvas-dark',p.canvasDark);}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
