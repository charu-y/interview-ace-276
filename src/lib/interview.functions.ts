import { createServerFn } from "@tanstack/react-start";

import { buildSystemPrompt } from "./interview-prompt";
import type { RoleId } from "./interview-data";

export type ChatMessage = { role: "assistant" | "user"; content: string };

type Input = { role: RoleId; messages: ChatMessage[] };

function validate(input: unknown): Input {
  const data = input as Input;
  if (!data || typeof data.role !== "string" || !Array.isArray(data.messages)) {
    throw new Error("Invalid interview request");
  }
  return {
    role: data.role,
    messages: data.messages
      .filter((m) => m && (m.role === "assistant" || m.role === "user"))
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
      .slice(-40),
  };
}

export const askInterviewer = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) throw new Error("Missing GROQ_API_KEY");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        messages: [
          { role: "system", content: buildSystemPrompt(data.role) },
          ...data.messages,
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Interviewer unavailable (${response.status}): ${detail.slice(0, 300)}`,
      );
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) throw new Error("The interviewer returned an empty response.");
    return { content };
  });
