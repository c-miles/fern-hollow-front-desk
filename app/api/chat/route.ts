import {
  streamText, convertToModelMessages, toUIMessageStream,
  createUIMessageStreamResponse, tool, smoothStream, type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getPolicies, logQuestion } from "@/lib/store";
import { buildSystemPrompt } from "@/lib/prompt";
import { chatLimitMessage } from "@/lib/ratelimit";
import {
  MAX_HISTORY_CHARS, MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS, MAX_REPLY_TOKENS, TOO_LONG_MESSAGE,
} from "@/lib/limits";

export const maxDuration = 60;

function lastUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return last?.parts.filter((p) => p.type === "text").map((p) => p.text).join(" ") ?? "";
}

// Resultless tool calls are dropped from history, teaching the model to stop citing and escalating.
const record = async () => "recorded";

function recentHistory(messages: UIMessage[]): UIMessage[] {
  const recent = messages.slice(-MAX_HISTORY_MESSAGES);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : recent.slice(firstUser);
}

export async function POST(req: Request) {
  const { messages: all }: { messages: UIMessage[] } = await req.json();
  const messages = Array.isArray(all) ? recentHistory(all) : [];
  const question = lastUserText(messages);
  if (!question.trim()) return new Response("Invalid request.", { status: 400 });
  if (question.length > MAX_QUESTION_CHARS || JSON.stringify(messages).length > MAX_HISTORY_CHARS) {
    return new Response(TOO_LONG_MESSAGE, { status: 413 });
  }

  const limited = await chatLimitMessage(req);
  if (limited) return new Response(limited, { status: 429 });

  const policies = await getPolicies();

  const result = streamText({
    model: anthropic("claude-sonnet-5"),
    instructions: buildSystemPrompt(policies),
    maxOutputTokens: MAX_REPLY_TOKENS,
    messages: await convertToModelMessages(messages, { ignoreIncompleteToolCalls: true }),
    tools: {
      cite: tool({
        description: "Report which policy ids grounded your answer. Call exactly once, at the very end of your reply, after your complete answer text. Empty array if no policy applied.",
        inputSchema: z.object({ policyIds: z.array(z.string()) }),
        execute: record,
      }),
      escalate: tool({
        description: "Flag a sensitive question for human staff. Call together with cite at the very end of your reply when the topic is sensitive. reason is a short category like medical, custody, staff-privacy, other-child, safety, billing-dispute.",
        inputSchema: z.object({ reason: z.string(), note: z.string() }),
        execute: record,
      }),
    },
    experimental_transform: smoothStream({ delayInMs: 10, chunking: "word" }),
    onEnd: async ({ text, steps }) => {
      const allToolCalls = steps.flatMap((s) => s.toolCalls ?? []);
      const cited = allToolCalls.find((c) => c.toolName === "cite")?.input as { policyIds?: string[] } | undefined;
      const escalated = allToolCalls.some((c) => c.toolName === "escalate");
      const citedIds = cited?.policyIds ?? [];
      const fullAnswer = steps.map((s) => s.text).filter(Boolean).join("\n\n") || text;
      await logQuestion({
        question,
        answer: fullAnswer,
        citedPolicyIds: citedIds,
        outcome: escalated ? "escalated" : citedIds.length === 0 ? "no_match" : "answered",
      });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
