export type AiTonePreset = {
  id: string;
  label: string;
  /** Appended to the user prompt for the AI request. */
  instruction: string;
};

export const AI_TONE_PRESETS: AiTonePreset[] = [
  {
    id: "shorter",
    label: "Shorter",
    instruction: "Make the result noticeably shorter while keeping the same meaning.",
  },
  {
    id: "professional",
    label: "Professional",
    instruction: "Use a clear, professional tone suitable for a business website.",
  },
  {
    id: "friendly",
    label: "Friendly",
    instruction: "Use warm, approachable language that feels welcoming to visitors.",
  },
  {
    id: "local",
    label: "Local",
    instruction: "Sound like a trusted local business serving the community.",
  },
  {
    id: "grammar",
    label: "Fix grammar",
    instruction: "Fix grammar and spelling; improve clarity without changing the core message.",
  },
];

export function buildAiPromptWithTone(
  userPrompt: string,
  toneId: string | null
): string {
  const base = userPrompt.trim();
  const tone = AI_TONE_PRESETS.find((t) => t.id === toneId);
  if (!tone) return base;
  if (!base) return tone.instruction;
  return `${base}\n\n${tone.instruction}`;
}
