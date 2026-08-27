import type { LogEntry, Policy } from "@/lib/types";

const BADGE: Record<LogEntry["outcome"], { label: string; cls: string }> = {
  answered: { label: "Answered", cls: "bg-pine-soft text-pine" },
  no_match: { label: "No match", cls: "bg-warn/10 text-warn" },
  escalated: { label: "Escalated", cls: "bg-terracotta-soft text-terracotta" },
};

export function QuestionLog({ entries, policies }: { entries: LogEntry[]; policies: Policy[] }) {
  const titleFor = (id: string) => policies.find((p) => p.id === id)?.title ?? id;
  if (entries.length === 0)
    return <p className="text-sm text-ink-soft">No questions yet. Ask Wren something in the Parent view.</p>;
  return (
    <ul className="divide-y divide-line">
      {entries.map((e) => (
        <li key={e.id} className="py-3 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-semibold text-ink">{e.question}</p>
            <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-md ${BADGE[e.outcome].cls}`}>
              {BADGE[e.outcome].label}
            </span>
          </div>
          <p className="text-sm text-ink-soft line-clamp-2">{e.answer}</p>
          <p className="text-xs text-ink-soft tabular-nums">
            {e.citedPolicyIds.length > 0 ? `Matched: ${e.citedPolicyIds.map(titleFor).join(", ")}` : "No policy matched"}
            {" · "}{new Date(e.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
          </p>
        </li>
      ))}
    </ul>
  );
}
