"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Plant, ArrowUp, Stop, Microphone } from "@phosphor-icons/react";
import { MessageBubble } from "./message-bubble";
import { VoiceWaveform } from "./voice-waveform";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { Policy } from "@/lib/types";

// Kept for later use; not currently rendered.
const CHIPS = [
  "Are you open on Veterans Day?",
  "What is the tuition for infants?",
  "How can I schedule a tour?",
];
const PHONE_NUMBER = "(555) 014-2400";

const MAX_TEXTAREA_HEIGHT = 120;

function growTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
}

export function Chat({ policies }: { policies: Policy[] }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const preVoiceTextRef = useRef("");
  const wasListeningRef = useRef(false);
  const suppressSubmitRef = useRef(false);
  const voice = useSpeechRecognition();
  const { messages, sendMessage, status, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    throttle: 50,
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (pinnedRef.current && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Reflect the live transcript into the input while recording, prepending
  // any text that was already there once (guarded so it never re-prepends).
  useEffect(() => {
    if (!voice.listening) return;
    const merged = preVoiceTextRef.current + voice.transcript;
    setInput(merged);
    growTextarea(inputRef.current);
  }, [voice.transcript, voice.listening]);

  const startVoice = () => {
    preVoiceTextRef.current = input.trim() ? `${input.trim()} ` : "";
    voice.start();
  };

  // Suppress a real-or-ghost send tap for a short window after recording
  // ends for any reason (manual stop, silence timeout, network drop) so a
  // "stop" tap that lands on the newly-swapped Send button never fires.
  useEffect(() => {
    const wasListening = wasListeningRef.current;
    wasListeningRef.current = voice.listening;
    if (wasListening && !voice.listening) {
      suppressSubmitRef.current = true;
      const t = setTimeout(() => { suppressSubmitRef.current = false; }, 500);
      return () => clearTimeout(t);
    }
  }, [voice.listening]);

  const submit = () => {
    if (suppressSubmitRef.current) return;
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
    pinnedRef.current = true;
    if (inputRef.current) inputRef.current.style.height = "auto";
    inputRef.current?.focus();
  };

  const composer = (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-end gap-2 rounded-full bg-pine-raised border border-cream/25 pl-5 pr-2 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] focus-within:border-cream/40"
      >
        <div className="relative flex-1 flex items-center min-h-11">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); growTextarea(e.target); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about hours, tuition, policies…"
            className={`w-full resize-none max-h-[7.5rem] overflow-y-auto bg-transparent text-[16px] text-cream placeholder:text-cream/50 caret-cream outline-none ${voice.listening ? "opacity-0 pointer-events-none" : ""}`}
          />
          {voice.listening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VoiceWaveform volume={voice.volume} />
            </div>
          )}
        </div>
        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            aria-label="Stop"
            className="size-11 rounded-full bg-cream/15 text-cream flex items-center justify-center touch-manipulation focus-visible:outline-2 focus-visible:outline-cream"
          >
            <Stop weight="fill" size={18} />
          </button>
        ) : voice.listening ? (
          <button
            type="button"
            onClick={() => voice.stop()}
            aria-label="Stop recording"
            className="size-11 rounded-full bg-cream/15 text-cream flex items-center justify-center touch-manipulation focus-visible:outline-2 focus-visible:outline-cream"
          >
            <Stop weight="fill" size={18} />
          </button>
        ) : input.trim() ? (
          <button
            type="submit"
            aria-label="Send"
            className="size-11 rounded-full bg-cream text-pine-deep flex items-center justify-center touch-manipulation focus-visible:outline-2 focus-visible:outline-cream"
          >
            <ArrowUp weight="bold" size={18} />
          </button>
        ) : voice.supported ? (
          <button
            type="button"
            onClick={startVoice}
            aria-label="Start voice input"
            className="size-11 rounded-full text-cream/70 hover:text-cream flex items-center justify-center touch-manipulation focus-visible:outline-2 focus-visible:outline-cream"
          >
            <Microphone weight="fill" size={20} />
          </button>
        ) : (
          <div aria-hidden className="size-11" />
        )}
      </form>
      {voice.error && !voice.listening && (
        <p className="mt-2 text-xs text-cream/70">{voice.error}</p>
      )}
    </>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 animate-[rise_0.4s_ease-out]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <Plant weight="fill" size={40} color="#F2F0EA" />
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-cream">Hi, I'm Wren.</h1>
            </div>
            <p className="text-lg text-cream/70">Fern Hollow's front desk AI.</p>
          </div>
          <div className="w-full max-w-[640px]">{composer}</div>
        </div>
      ) : (
        <>
          <div
            ref={logRef}
            role="log"
            onScroll={() => {
              const el = logRef.current;
              if (el) pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            }}
            className="scroll-area flex-1 overflow-y-auto overscroll-contain [mask-image:linear-gradient(to_bottom,transparent_0,black_40px)]"
          >
            <div className="max-w-[680px] mx-auto px-5 pt-12 pb-6 space-y-6">
              {messages.map((m) => <MessageBubble key={m.id} message={m} policies={policies} />)}
              {busy && (
                <div role="status" aria-label={status === "submitted" ? "Checking the handbook" : "Wren is still writing"} className="flex items-center gap-2.5 text-cream/70">
                  <Plant weight="fill" size={24} className="animate-[pulse_1.2s_ease-in-out_infinite]" />
                  {status === "submitted" && (
                    <span className="text-[16px] leading-7 animate-pulse">Checking our family handbook…</span>
                  )}
                </div>
              )}
              {status === "error" && (
                <div className="text-sm text-cream/90">
                  Sorry, that didn't go through.{" "}
                  <button onClick={() => regenerate()} className="underline font-semibold text-cream focus-visible:outline-2 focus-visible:outline-cream">Try again</button>
                </div>
              )}
            </div>
          </div>
          <div className="w-full max-w-[680px] mx-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {composer}
          </div>
        </>
      )}
    </div>
  );
}
