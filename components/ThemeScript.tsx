import { THEME_STORAGE_KEY } from "@/lib/theme";

/** Runs before paint to reduce theme flash on load. Default: light. */
export function ThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=t==='dark';var el=document.documentElement;if(d){el.classList.add('dark');el.setAttribute('data-theme','dark');}else{el.classList.remove('dark');el.setAttribute('data-theme','light');}}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
