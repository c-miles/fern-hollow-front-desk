"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Policy } from "@/lib/types";

export function PolicyEditor({ initial }: { initial: Policy[] }) {
  const [policies, setPolicies] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const router = useRouter();

  async function save(next: Policy[]) {
    setSaving(true);
    setPolicies(next);
    await fetch("/api/policies", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {policies.map((p) => (
        <div key={p.id} className="bg-surface border border-line rounded-[10px]">
          <button onClick={() => setOpenId(openId === p.id ? null : p.id)}
            className="w-full text-left px-4 py-3 font-semibold text-[15px] text-ink">
            {p.title}
          </button>
          {openId === p.id && (
            <div className="px-4 pb-3 space-y-2">
              <textarea
                value={p.body} rows={5}
                onChange={(e) => setPolicies(policies.map((q) => q.id === p.id ? { ...q, body: e.target.value } : q))}
                className="w-full text-sm p-3 bg-paper border border-line rounded-lg outline-none focus:border-pine"
              />
              <button onClick={() => save(policies)} disabled={saving}
                className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div className="bg-surface border border-line rounded-[10px] p-4 space-y-2">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Policy title" className="w-full text-sm p-2.5 bg-paper border border-line rounded-lg outline-none focus:border-pine" />
          <textarea value={draft.body} rows={4} onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            placeholder="Policy text" className="w-full text-sm p-3 bg-paper border border-line rounded-lg outline-none focus:border-pine" />
          <button
            onClick={() => {
              const id = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              if (!id || !draft.body.trim()) return;
              save([...policies, { id, title: draft.title, body: draft.body }]);
              setDraft({ title: "", body: "" });
              setAdding(false);
            }}
            disabled={saving}
            className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50">
            Add policy
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-sm font-semibold text-pine underline">
          Add a policy
        </button>
      )}
    </div>
  );
}
