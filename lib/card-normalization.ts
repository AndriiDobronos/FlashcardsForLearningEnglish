export function normalizeEnglishText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function isDuplicateCardError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && String(error.code) === "23505";
}
