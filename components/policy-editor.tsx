"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash } from "@phosphor-icons/react";
import type { Policy } from "@/lib/types";

export function PolicyEditor({ initial, children }: { initial: Policy[]; children: React.ReactNode }) {
  const [policies, setPolicies] = useState(initial);
  const [savedPolicies, setSavedPolicies] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  async function save(next: Policy[]) {
    setSaving(true);
    setSaveFailed(false);
    setPolicies(next);
    try {
      const res = await fetch("/api/policies", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
      if (!res.ok) throw new Error("save failed");
      setSavedPolicies(next);
      router.refresh();
      return true;
    } catch {
      setSaveFailed(true);
      return false;
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

  function dismiss() {
    setSelectedId(null);
    setAdding(false);
    setDraft({ title: "", body: "" });
    setConfirmingDelete(false);
  }

  function closeEditor() {
    if (selectedId !== null) {
      revert(selectedId);
    }
    dismiss();
  }

  function openAdd() {
    if (selectedId !== null) {
      revert(selectedId);
    }
    setSelectedId(null);
    setAdding(true);
  }

  const selectedPolicy = selectedId !== null ? policies.find((p) => p.id === selectedId) ?? null : null;
  const isOpen = selectedPolicy !== null || adding;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeEditor();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedPolicy) {
      textareaRef.current?.focus();
    } else if (adding) {
      titleInputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-[340px_1fr] items-start md:items-stretch md:h-full md:min-h-0">
        <section className="bg-paper rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)] p-5 md:flex md:flex-col md:min-h-0 md:self-start md:max-h-full">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">Handbook</h2>
            <button onClick={openAdd} className="text-sm font-semibold text-pine underline hover:text-pine-deep focus-visible:outline-2 focus-visible:outline-pine">
              Add a policy
            </button>
          </div>
          <p className="text-sm text-ink-soft mt-1 mb-4">Wren answers only from these policies. Edits apply immediately.</p>
          <div className="md:flex-1 md:min-h-0 overflow-y-auto scroll-area -mx-2 px-2 space-y-1">
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
        <div className="min-w-0 space-y-5 md:h-full md:min-h-0 md:flex md:flex-col">{children}</div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[rgba(22,56,46,0.6)]"
          onClick={closeEditor}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedPolicy ? "Edit policy" : "Add a policy"}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] max-h-[85dvh] overflow-y-auto scroll-area bg-paper rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)] animate-[rise_0.2s_ease-out]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-lg font-semibold text-ink">{selectedPolicy ? selectedPolicy.title : "Add a policy"}</h3>
              <button
                onClick={closeEditor}
                aria-label="Close"
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-ink-soft hover:bg-pine-soft/50 focus-visible:outline-2 focus-visible:outline-pine">
                <X size={20} />
              </button>
            </div>
            {selectedPolicy ? (
              <div className="space-y-2">
                <textarea
                  ref={textareaRef}
                  value={selectedPolicy.body} rows={10}
                  onChange={(e) => setPolicies(policies.map((q) => q.id === selectedPolicy.id ? { ...q, body: e.target.value } : q))}
                  className="w-full text-sm p-3 bg-paper border border-line rounded-lg outline-none focus:border-pine"
                />
                {saveFailed && <p className="text-sm text-bad">Could not save. Please try again.</p>}
                {!confirmingDelete ? (
                  <div className="flex items-center justify-between gap-3">
                    <button onClick={async () => { const ok = await save(policies); if (ok) dismiss(); }} disabled={saving}
                      className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50 hover:brightness-90 transition focus-visible:outline-2 focus-visible:outline-pine">
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button onClick={() => setConfirmingDelete(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-bad text-cream hover:brightness-90 transition focus-visible:outline-2 focus-visible:outline-bad">
                      <Trash size={16} />
                      Delete policy
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-ink">Delete this policy? This cannot be undone.</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => { const ok = await save(policies.filter((p) => p.id !== selectedId)); if (ok) dismiss(); }}
                        disabled={saving}
                        className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-bad text-cream disabled:opacity-50 hover:brightness-90 transition focus-visible:outline-2 focus-visible:outline-bad">
                        Delete
                      </button>
                      <button onClick={() => setConfirmingDelete(false)}
                        className="px-3.5 py-2 text-sm font-semibold rounded-lg text-ink-soft hover:bg-pine-soft/50 transition focus-visible:outline-2 focus-visible:outline-pine">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={titleInputRef}
                  value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Policy title" className="w-full text-sm p-2.5 bg-paper border border-line rounded-lg outline-none focus:border-pine" />
                <textarea value={draft.body} rows={10} onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Policy text" className="w-full text-sm p-3 bg-paper border border-line rounded-lg outline-none focus:border-pine" />
                <button
                  onClick={async () => {
                    const id = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    if (!id || !draft.body.trim()) return;
                    const ok = await save([...policies, { id, title: draft.title, body: draft.body }]);
                    if (ok) dismiss();
                  }}
                  disabled={saving}
                  className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-pine text-cream disabled:opacity-50 hover:brightness-90 transition focus-visible:outline-2 focus-visible:outline-pine">
                  Add policy
                </button>
                {saveFailed && <p className="text-sm text-bad">Could not save. Please try again.</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
