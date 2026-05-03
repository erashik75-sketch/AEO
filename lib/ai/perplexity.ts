export async function callPerplexity(prompt: string): Promise<string> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:
        process.env.PERPLEXITY_MODEL?.trim() ||
        "llama-3.1-sonar-large-128k-online",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Perplexity API error: ${response.status} ${err}`);
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}
