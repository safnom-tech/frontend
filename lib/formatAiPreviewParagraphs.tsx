export function splitPreviewParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.includes("\n\n")) {
    return trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }
  if (trimmed.length > 280) {
    const sentences =
      trimmed.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ??
      [trimmed];
    if (sentences.length >= 3) {
      const out: string[] = [];
      for (let i = 0; i < sentences.length; i += 2) {
        out.push(sentences.slice(i, i + 2).join(" "));
      }
      return out;
    }
  }
  return [trimmed];
}
