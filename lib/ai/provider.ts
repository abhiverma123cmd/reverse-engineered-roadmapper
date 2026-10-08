export interface AICompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonSchemaName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;
  readonly available: boolean;
  completeJson(options: AICompletionOptions): Promise<unknown>;
}

/**
 * Minimal OpenAI-compatible chat-completions provider.
 * Works with OpenAI, OpenRouter, Azure proxies, Ollama, LM Studio, etc.
 * Credentials come from env vars only (server-side).
 */
class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  readonly available: boolean;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey =
      process.env.AI_API_KEY ??
      process.env.OPENAI_API_KEY ??
      process.env.OPENROUTER_API_KEY ??
      "";
    this.baseUrl =
      process.env.AI_BASE_URL ??
      process.env.OPENAI_BASE_URL ??
      "https://api.openai.com/v1";
    this.model = process.env.AI_MODEL ?? "gpt-4o-mini";
    this.name = `openai-compatible(${this.model})`;
    this.available = this.apiKey.length > 0;
  }

  async completeJson(options: AICompletionOptions): Promise<unknown> {
    if (!this.available) throw new Error("AI_API_KEY is not configured.");
    const url = `${this.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 4000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: options.userPrompt },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI provider error (${res.status}): ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("AI provider returned empty content.");
    return JSON.parse(content);
  }
}

/**
 * Google Gemini provider (generative-language REST API).
 * Activated when GEMINI_API_KEY or GOOGLE_API_KEY is set.
 */
class GeminiProvider implements AIProvider {
  readonly name: string;
  readonly available: boolean;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
    this.model = process.env.AI_MODEL ?? "gemini-3.8-flash";
    this.name = `gemini(${this.model})`;
    this.available = this.apiKey.length > 0;
  }

  async completeJson(options: AICompletionOptions): Promise<unknown> {
    if (!this.available) throw new Error("GEMINI_API_KEY is not configured.");
    // Fail over across models on capacity/availability errors (429/503)
    // or retired model names (404). AI_MODEL pins the first choice.
    const chain = [
      this.model,
      ...["gemini-flash-latest", "gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"].filter(
        (m) => m !== this.model
      ),
    ];
    let lastError: unknown = null;
    for (const model of chain) {
      try {
        return await this.tryModel(model, options);
      } catch (e) {
        lastError = e;
        if (!isRetryable(e)) throw e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");
  }

  private async tryModel(model: string, options: AICompletionOptions): Promise<unknown> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` +
      encodeURIComponent(this.apiKey);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.systemPrompt }] },
        contents: [{ parts: [{ text: options.userPrompt }] }],
        generationConfig: { temperature: options.temperature ?? 0.4, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Gemini error (${res.status}): ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("Gemini returned empty content.");
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

/** Retryable across models: rate limits, capacity, retired names. Auth/quota errors throw immediately. */
function isRetryable(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /Gemini error \((404|429|503)\)/.test(msg);
}

export function getProvider(): AIProvider {
  const gemini = new GeminiProvider();
  if (gemini.available) return gemini;
  return new OpenAICompatibleProvider();
}

export function isAIConfigured(): boolean {
  return getProvider().available;
}
