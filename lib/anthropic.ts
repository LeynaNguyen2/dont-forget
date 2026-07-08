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
  userPrompt: string,
  options?: { maxTokens?: number }
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
      max_tokens: options?.maxTokens ?? 512,
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
  expanded: string;
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
  const expanded =
    typeof parsed.expanded === "string" ? parsed.expanded.trim() : "";
  const fullBrief =
    typeof parsed.fullBrief === "string" ? parsed.fullBrief.trim() : "";

  if (!summary || !expanded || !fullBrief) {
    throw new Error("Missing summary, expanded, or fullBrief");
  }

  return {
    summary: summary.length > 80 ? `${summary.slice(0, 77)}...` : summary,
    expanded,
    fullBrief,
  };
}

const BRIEF_TRIPLE_JSON_PROMPT = `Return valid JSON only with exactly these keys:
{"summary":"one line under 80 characters — event count, weather, and top event","expanded":"3-4 short actionable prep lines separated by \\\\n, each starting with an emoji. Focus on what to bring, wear, leave-by times, and motivation. Example: \\\"☀️ No jacket needed today, 66°F\\\\n💧 Bring water — it'll warm up to 80°F\\\\n📍 Leave by 2:45 for your 3pm meeting\\\\n💪 Big presentation today — you've got this!\\\"","fullBrief":"the full conversational 3-sentence morning brief for in-app display"}
Do not wrap in markdown or code fences.`;

export async function generateBriefPair(
  systemPrompt: string,
  userPrompt: string
): Promise<MorningBriefPair> {
  const raw = await generateBrief(
    systemPrompt,
    `${userPrompt}\n\n${BRIEF_TRIPLE_JSON_PROMPT}`,
    { maxTokens: 768 }
  );

  try {
    return parseBriefPairResponse(raw);
  } catch {
    const cleaned = stripMarkdownCodeFences(raw);
    const summary =
      cleaned.length > 80 ? `${cleaned.slice(0, 77)}...` : cleaned;
    return {
      summary,
      expanded: summary,
      fullBrief: cleaned,
    };
  }
}
