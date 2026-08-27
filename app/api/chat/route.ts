import {
  streamText, convertToModelMessages, toUIMessageStream,
  createUIMessageStreamResponse, tool, smoothStream, type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getPolicies, logQuestion } from "@/lib/store";
import { buildSystemPrompt } from "@/lib/prompt";

export const maxDuration = 60;

function lastUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return last?.parts.filter((p) => p.type === "text").map((p) => p.text).join(" ") ?? "";
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const policies = await getPolicies();

  const result = streamText({
    model: anthropic("claude-opus-5"),
    instructions: buildSystemPrompt(policies),
    messages: await convertToModelMessages(messages, { ignoreIncompleteToolCalls: true }),
    tools: {
      cite: tool({
        description: "Report which policy ids grounded your answer. Call exactly once, at the very end of your reply, after your complete answer text. Empty array if no policy applied.",
        inputSchema: z.object({ policyIds: z.array(z.string()) }),
      }),
      escalate: tool({
        description: "Flag a sensitive question for human staff. Call together with cite at the very end of your reply when the topic is sensitive. reason is a short category like medical, custody, staff-privacy, other-child, safety, billing-dispute.",
        inputSchema: z.object({ reason: z.string(), note: z.string() }),
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
        question: lastUserText(messages),
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
