"use client";
import type { UIMessage } from "ai";
import type { Policy } from "@/lib/types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const mdComponents: Components = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  a: ({ node, ...props }) => <a className="underline" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-cream/15 px-1 py-0.5 text-[0.9em]" {...props} />,
  pre: ({ node, ...props }) => <pre className="overflow-x-auto rounded bg-cream/10 p-3 my-2 text-[0.9em]" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l border-cream/30 pl-3 italic" {...props} />,
  h1: ({ node, ...props }) => <h2 className="font-semibold mt-2 mb-1" {...props} />,
  h2: ({ node, ...props }) => <h2 className="font-semibold mt-2 mb-1" {...props} />,
  h3: ({ node, ...props }) => <h3 className="font-semibold mt-2 mb-1" {...props} />,
  table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="w-full text-sm border-collapse" {...props} /></div>,
  th: ({ node, ...props }) => <th className="border border-cream/25 px-2 py-1 text-left font-semibold" {...props} />,
  td: ({ node, ...props }) => <td className="border border-cream/25 px-2 py-1" {...props} />,
};

export function MessageBubble({ message, policies }: { message: UIMessage; policies: Policy[] }) {
  const isUser = message.role === "user";
  const titleFor = (id: string) => policies.find((p) => p.id === id)?.title ?? id;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={
        isUser
          ? "max-w-[80%] px-4 py-2.5 text-[16px] leading-7 bg-cream text-ink rounded-2xl rounded-br-md shadow-[0_2px_8px_rgba(0,0,0,0.25)] space-y-3"
          : "w-full text-[16px] leading-7 text-cream [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] space-y-3"
      }>
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return isUser
              ? <p key={i} className="whitespace-pre-wrap">{part.text}</p>
              : <div key={i} className="md-body"><Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>{part.text}</Markdown></div>;
          }
          if (part.type === "tool-cite" && (part.state === "input-available" || part.state === "output-available")) {
            const ids = (part.input as { policyIds: string[] }).policyIds;
            if (ids.length === 0) return null;
            return (
              <p key={i} className="text-xs text-cream/60">
                From the Parent Handbook: {ids.map(titleFor).join(", ")}
              </p>
            );
          }
          if (part.type === "tool-escalate" && (part.state === "input-available" || part.state === "output-available")) {
            return (
              <div key={i} className="rounded-[10px] border border-terracotta/20 bg-paper px-3 py-2.5 text-sm [text-shadow:none] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)]">
                <span className="inline-flex items-center rounded-full bg-terracotta-soft px-2.5 py-0.5 text-xs font-semibold text-terracotta">Flagged for the front desk</span>
                <p className="text-ink-soft text-xs mt-2">
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
