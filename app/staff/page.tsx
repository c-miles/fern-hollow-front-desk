import { getLog, getPolicies } from "@/lib/store";
import { PolicyEditor } from "@/components/policy-editor";
import { QuestionLog } from "@/components/question-log";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [policies, log] = await Promise.all([getPolicies(), getLog()]);
  return (
    <main className="flex-1 min-h-0 overflow-y-auto scroll-area md:overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 py-5 md:h-full">
        <PolicyEditor initial={policies}>
          <section className="bg-paper rounded-[10px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)] md:flex md:flex-col md:min-h-0 md:flex-1">
            <h1 className="font-display text-xl font-semibold text-ink mb-1">Question log</h1>
            <p className="text-sm text-ink-soft mb-4">What families are asking Wren, and where she needed help.</p>
            <QuestionLog entries={log} policies={policies} />
          </section>
        </PolicyEditor>
      </div>
    </main>
  );
}
