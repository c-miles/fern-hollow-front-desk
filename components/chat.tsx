"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef } from "react";
import { Plant } from "@phosphor-icons/react";
import { MessageBubble } from "./message-bubble";
import type { Policy } from "@/lib/types";

const CHIPS = [
  "Are you open on Veterans Day?",
  "What is the tuition for infants?",
  "How can I schedule a tour?",
];

export function Chat({ policies }: { policies: Policy[] }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    throttle: 50,
  });
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-[580px] mx-auto bg-paper sm:my-4 sm:rounded-[16px] sm:overflow-hidden sm:shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.16),0_24px_48px_rgba(0,0,0,0.18)]">
      <div role="log" className="scroll-area flex-1 overflow-y-auto px-4 py-4 space-y-3 overscroll-contain">
        {messages.length === 0 && (
          <div className="min-h-full flex flex-col items-center justify-center text-center gap-5 px-6 animate-[rise_0.4s_ease-out]">
            <Plant weight="duotone" size={44} color="#1F4D3F" />
            <p className="font-display text-2xl font-semibold text-ink">Hi, I'm Wren.</p>
            <p className="text-[15px] text-ink-soft max-w-[40ch]">
              Fern Hollow's front desk AI. For anything urgent about your child today, call{" "}
              <a className="underline text-pine" href="tel:5550142400">(555) 014-2400</a>.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {CHIPS.map((c) => (
                <button key={c} onClick={() => { sendMessage({ text: c }); inputRef.current?.focus(); }}
                  className="min-h-11 px-4 py-2 text-sm font-semibold text-pine bg-surface border border-line rounded-full hover:border-pine touch-manipulation focus-visible:outline-2 focus-visible:outline-pine">
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
        className="flex gap-2 px-4 py-3 bg-paper pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <input
          ref={inputRef}
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about hours, tuition, policies…"
          className="flex-1 text-[16px] px-4 py-2.5 bg-surface border border-line rounded-full outline-none focus:border-pine"
        />
        {busy
          ? <button type="button" onClick={() => stop()} className="min-h-11 px-5 rounded-full bg-line text-ink font-semibold touch-manipulation focus-visible:outline-2 focus-visible:outline-pine">Stop</button>
          : <button type="submit" className="min-h-11 px-5 rounded-full bg-pine text-cream font-semibold touch-manipulation focus-visible:outline-2 focus-visible:outline-pine">Send</button>}
      </form>
    </div>
  );
}
