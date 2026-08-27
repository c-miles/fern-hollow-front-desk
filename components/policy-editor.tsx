"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Policy } from "@/lib/types";

export function PolicyEditor({ initial, children }: { initial: Policy[]; children: React.ReactNode }) {
  const [policies, setPolicies] = useState(initial);
  const [savedPolicies, setSavedPolicies] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const router = useRouter();

  async function save(next: Policy[]) {
    setSaving(true);
    setSaveFailed(false);
    setPolicies(next);
    try {
      const res = await fetch("/api/policies", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
      if (!res.ok) throw new Error("save failed");
      setSavedPolicies(next);
      router.refresh();
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  function revert(id: string) {
    setPolicies((cur) => cur.map((q) => (q.id === id ? (savedPolicies.find((s) => s.id === q.id) ?? q) : q)));
  }

  function selectPolicy(id: string) {
    if (selectedId !== null && selectedId !== id) {
      revert(selectedId);
    }
    setAdding(false);
    setSelectedId(selectedId === id ? null : id);
  }

  function closeEditor() {
    if (selectedId !== null) {
      revert(selectedId);
    }
    setSelectedId(null);
  }

  function openAdd() {
    if (selectedId !== null) {
      revert(selectedId);
    }
    setSelectedId(null);
    setAdding(true);
  }

  const selectedPolicy = selectedId !== null ? policies.find((p) => p.id === selectedId) ?? null : null;

  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr] items-start">
      <section className="bg-paper rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Handbook</h2>
          <button onClick={openAdd} className="text-sm font-semibold text-pine underline focus-visible:outline-2 focus-visible:outline-pine">
            Add a policy
          </button>
        </div>
        <p className="text-sm text-ink-soft mt-1 mb-4">Wren answers only from these policies. Edits apply immediately.</p>
        <div className="max-h-[420px] overflow-y-auto scroll-area -mx-2 px-2 space-y-1">
          {policies.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPolicy(p.id)}
              aria-current={selectedId === p.id ? "true" : undefined}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-pine ${
                selectedId === p.id ? "bg-pine-soft text-pine" : "text-ink hover:bg-pine-soft/50"
              }`}>
              {p.title}
            </button>
          ))}
        </div>
      </section>
      <div className="min-w-0 space-y-5">
        {(selectedPolicy || adding) && (
          <div className="bg-paper rounded-[10px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)]">
            {selectedPolicy ? (
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-ink">{selectedPolicy.title}</h3>
                <textarea
                  value={selectedPolicy.body} rows={10}
                  onChange={(e) => setPolicies(policies.map((q) => q.id === selectedPolicy.id ? { ...q, body: e.target.value } : q))}
                  className="w-full text-sm p-3 bg-paper border border-line rounded-lg outline-none focus:border-pine"
                />
                <div className="flex items-center gap-3">
                  <button onClick={() => save(policies)} disabled={saving}
                    className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-pine">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button onClick={closeEditor} className="text-sm font-semibold text-ink-soft underline focus-visible:outline-2 focus-visible:outline-pine">
                    Close
                  </button>
                </div>
                {saveFailed && <p className="text-sm text-bad">Could not save. Please try again.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-ink">Add a policy</h3>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Policy title" className="w-full text-sm p-2.5 bg-paper border border-line rounded-lg outline-none focus:border-pine" />
                <textarea value={draft.body} rows={10} onChange={(e) => setDraft({ ...draft, body: e.target.value })}
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
                  className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-pine">
                  Add policy
                </button>
                {saveFailed && <p className="text-sm text-bad">Could not save. Please try again.</p>}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
