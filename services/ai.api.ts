import { apiRequest } from "@/lib/api-client";
import type {
  ComposedSectionGenerateInput,
  ComposedSectionResponse,
  GenerateWebsiteInput,
  GenerateWebsiteResponse,
  FieldContentGenerateInput,
  FieldContentGenerateResponse,
  SectionActionInput,
  SectionActionResponse,
} from "@/types/ai";

function base(workspaceId: string) {
  return `/workspaces/${workspaceId}/ai`;
}

export async function generateWebsiteWithAi(
  workspaceId: string,
  input: GenerateWebsiteInput
): Promise<GenerateWebsiteResponse> {
  return apiRequest<GenerateWebsiteResponse>(`${base(workspaceId)}/website/generate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function runSectionAiAction(
  workspaceId: string,
  input: SectionActionInput
): Promise<SectionActionResponse> {
  return apiRequest<SectionActionResponse>(`${base(workspaceId)}/section/action`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function generateComposedSection(
  workspaceId: string,
  input: ComposedSectionGenerateInput
): Promise<ComposedSectionResponse> {
  return apiRequest<ComposedSectionResponse>(`${base(workspaceId)}/sections/generate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function regenerateComposedSection(
  workspaceId: string,
  input: ComposedSectionGenerateInput & { currentSection: NonNullable<ComposedSectionGenerateInput["currentSection"]> }
): Promise<ComposedSectionResponse> {
  return apiRequest<ComposedSectionResponse>(`${base(workspaceId)}/sections/regenerate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function generateFieldContent(
  workspaceId: string,
  input: FieldContentGenerateInput
): Promise<FieldContentGenerateResponse> {
  return apiRequest<FieldContentGenerateResponse>(`${base(workspaceId)}/content/generate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function editComposedSectionWithAi(
  workspaceId: string,
  input: ComposedSectionGenerateInput & { currentSection: NonNullable<ComposedSectionGenerateInput["currentSection"]> }
): Promise<ComposedSectionResponse> {
  return apiRequest<ComposedSectionResponse>(`${base(workspaceId)}/sections/edit`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
