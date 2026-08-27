"use client";
import type { UIMessage } from "ai";
import type { Policy } from "@/lib/types";

export function MessageBubble({ message, policies }: { message: UIMessage; policies: Policy[] }) {
  const isUser = message.role === "user";
  const titleFor = (id: string) => policies.find((p) => p.id === id)?.title ?? id;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={
        isUser
          ? "max-w-[85%] px-4 py-2.5 text-[15px] leading-relaxed bg-pine-soft text-ink rounded-2xl rounded-br-md"
          : "w-full px-1 text-[15px] leading-relaxed text-ink"
      }>
        {message.parts.map((part, i) => {
          if (part.type === "text") return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
          if (part.type === "tool-cite" && (part.state === "input-available" || part.state === "output-available")) {
            const ids = (part.input as { policyIds: string[] }).policyIds;
            if (ids.length === 0) return null;
            return (
              <p key={i} className="mt-2 text-xs text-ink-soft">
                From the Parent Handbook: {ids.map(titleFor).join(", ")}
              </p>
            );
          }
          if (part.type === "tool-escalate" && (part.state === "input-available" || part.state === "output-available")) {
            return (
              <div key={i} className="mt-2 rounded-lg bg-terracotta-soft border border-terracotta/30 px-3 py-2 text-sm">
                <p className="font-semibold text-terracotta">Flagged for the front desk</p>
                <p className="text-ink-soft text-xs mt-1">
                  A staff member will follow up. If it is urgent, call <a className="underline" href="tel:5550142400">(555) 014-2400</a>.
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
