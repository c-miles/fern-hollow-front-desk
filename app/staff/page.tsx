import { getLog, getPolicies } from "@/lib/store";
import { PolicyEditor } from "@/components/policy-editor";
import { QuestionLog } from "@/components/question-log";
import Grainient from "@/components/grainient";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [policies, log] = await Promise.all([getPolicies(), getLog()]);
  return (
    <main className="relative bg-pine-deep min-h-[calc(100dvh-57px)]">
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <Grainient color1="#35705B" color2="#1F4D3F" color3="#16382E" timeSpeed={0.6} grainAmount={0.08} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-6 grid gap-6 md:grid-cols-[2fr_1fr] items-start">
        <section className="bg-paper rounded-[10px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Question log</h1>
          <p className="text-sm text-ink-soft mb-4">What families are asking Wren, and where she needed help.</p>
          <QuestionLog entries={log} policies={policies} />
        </section>
        <section className="bg-paper rounded-[10px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
          <h2 className="font-display text-xl font-semibold text-ink mb-1">Handbook</h2>
          <p className="text-sm text-ink-soft mb-4">Wren answers only from these policies. Edits apply immediately.</p>
          <PolicyEditor initial={policies} />
        </section>
      </div>
    </main>
  );
}
