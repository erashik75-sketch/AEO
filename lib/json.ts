/** Extract JSON object from LLM output that may wrap JSON in markdown fences. */
export function parseJsonObject<T>(text: string): T {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const inner = fence ? fence[1].trim() : trimmed;
  const start = inner.indexOf("{");
  const end = inner.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(inner.slice(start, end + 1)) as T;
}
