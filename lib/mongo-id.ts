const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export function isMongoObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_REGEX.test(value.trim());
}

export function normalizeMongoObjectId(value: unknown): string | undefined {
  if (!isMongoObjectId(value)) return undefined;
  return value.trim();
}
