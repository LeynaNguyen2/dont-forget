interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicTextBlock[];
  error?: {
    type?: string;
    message?: string;
  };
}

export async function generateBrief(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  const data = (await response.json()) as AnthropicMessageResponse;

  if (!response.ok) {
    throw new Error(
      data.error?.message ?? `Anthropic API request failed (${response.status})`
    );
  }

  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Anthropic API returned no text content");
  }

  return text.trim();
}

export interface MorningBriefPair {
  summary: string;
  fullBrief: string;
}

export function stripMarkdownCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\r?\n?/i, "")
    .replace(/\r?\n?```\s*$/i, "")
    .trim();
}

export function parseBriefPairResponse(raw: string): MorningBriefPair {
  const cleaned = stripMarkdownCodeFences(raw);
  const jsonText = cleaned.match(/\{[\s\S]*\}/)?.[0] ?? cleaned;

  const parsed = JSON.parse(jsonText) as Partial<MorningBriefPair>;
  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const fullBrief =
    typeof parsed.fullBrief === "string" ? parsed.fullBrief.trim() : "";

  if (!summary || !fullBrief) {
    throw new Error("Missing summary or fullBrief");
  }

  return {
    summary: summary.length > 80 ? `${summary.slice(0, 77)}...` : summary,
    fullBrief,
  };
}

export async function generateBriefPair(
  systemPrompt: string,
  userPrompt: string
): Promise<MorningBriefPair> {
  const raw = await generateBrief(
    systemPrompt,
    `${userPrompt}

Return valid JSON only with exactly these keys:
{"summary":"one-line preview under 80 characters — event count, temp, location, top tip","fullBrief":"the full 3-sentence morning brief"}
Do not wrap in markdown or code fences.`
  );

  try {
    return parseBriefPairResponse(raw);
  } catch {
    const cleaned = stripMarkdownCodeFences(raw);
    return {
      fullBrief: cleaned,
      summary:
        cleaned.length > 80 ? `${cleaned.slice(0, 77)}...` : cleaned,
    };
  }
}
