"use client";
import { useEffect, useRef, type MutableRefObject } from "react";

const BAR_COUNT = 32;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 40;

// Center-weighted Gaussian envelope so the middle bars read taller at rest.
const ENVELOPE = Array.from({ length: BAR_COUNT }, (_, i) => {
  const center = (BAR_COUNT - 1) / 2;
  const sigma = BAR_COUNT / 4.5;
  return Math.exp(-((i - center) ** 2) / (2 * sigma * sigma));
});

export function VoiceWaveform({ volume }: { volume: MutableRefObject<number> }) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const h = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * ENVELOPE[i];
        bar.style.height = `${h}px`;
      });
      return;
    }

    const tick = () => {
      phaseRef.current += 0.12;
      const vol = volume.current;
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const envelope = ENVELOPE[i];
        const amp = 0.06 + 0.94 * vol;
        const wobble = 1 + 0.35 * vol * Math.sin(phaseRef.current + i * 0.5);
        const h = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * envelope * amp * wobble;
        bar.style.height = `${Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h))}px`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [volume]);

  return (
    <div className="flex items-center justify-center h-11 w-full" style={{ gap: BAR_GAP }} aria-hidden>
      {ENVELOPE.map((e, i) => (
        <div
          key={i}
          ref={(el) => { barRefs.current[i] = el; }}
          className="bg-cream rounded-full"
          style={{ width: BAR_WIDTH, height: MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * e }}
        />
      ))}
    </div>
  );
}
