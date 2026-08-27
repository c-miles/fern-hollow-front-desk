"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import Grainient from "./grainient";
import type { Policy } from "@/lib/types";

const CHIPS = [
  "Are you open on Veterans Day?",
  "What is the tuition for infants?",
  "What's your sick child policy?",
  "How can I schedule a tour?",
];

export function Chat({ policies }: { policies: Policy[] }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="relative bg-pine-deep min-h-[calc(100dvh-57px)]">
    <div className="pointer-events-none absolute inset-0 hidden sm:block">
      <Grainient color1="#35705B" color2="#1F4D3F" color3="#16382E" timeSpeed={0.6} grainAmount={0.08} />
    </div>
    <div className="relative z-10 flex flex-col h-[calc(100dvh-57px)] max-w-[440px] mx-auto bg-paper sm:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div role="log" className="flex-1 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain">
        {messages.length === 0 && (
          <div className="pt-8 space-y-4">
            <div className="space-y-2">
              <p className="font-display text-xl font-semibold text-ink">Hi, I'm Wren.</p>
              <p className="text-[15px] text-ink-soft">
                I'm Fern Hollow's front desk assistant (an AI). I can answer questions about hours,
                tuition, and our policies. For anything urgent about your child today, call us at{" "}
                <a className="underline text-pine" href="tel:5550142400">(555) 014-2400</a>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((c) => (
                <button key={c} onClick={() => { sendMessage({ text: c }); inputRef.current?.focus(); }}
                  className="min-h-11 px-3.5 py-2 text-sm font-semibold text-pine bg-surface border border-line rounded-xl hover:border-pine touch-manipulation focus-visible:outline-2 focus-visible:outline-pine">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => <MessageBubble key={m.id} message={m} policies={policies} />)}
        {status === "submitted" && (
          <p role="status" aria-label="Checking the handbook" className="text-sm text-ink-soft animate-pulse">
            Checking our family handbook…
          </p>
        )}
        {status === "error" && (
          <div className="text-sm text-bad">
            Sorry, that didn't go through.{" "}
            <button onClick={() => regenerate()} className="underline font-semibold focus-visible:outline-2 focus-visible:outline-pine">Try again</button>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!input.trim() || busy) return; sendMessage({ text: input }); setInput(""); inputRef.current?.focus(); }}
        className="flex gap-2 px-4 py-3 border-t border-line bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <input
          ref={inputRef}
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about hours, tuition, policies…"
          className="flex-1 text-[16px] px-3.5 py-2.5 bg-paper border border-line rounded-xl outline-none focus:border-pine"
        />
        {busy
          ? <button type="button" onClick={() => stop()} className="min-h-11 px-4 rounded-xl bg-line text-ink font-semibold focus-visible:outline-2 focus-visible:outline-pine">Stop</button>
          : <button type="submit" className="min-h-11 px-4 rounded-xl bg-pine text-cream font-semibold touch-manipulation focus-visible:outline-2 focus-visible:outline-pine">Send</button>}
      </form>
    </div>
    </div>
  );
}
