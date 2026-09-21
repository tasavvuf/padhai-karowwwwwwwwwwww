import { useCallback, useRef, useState } from "react";

interface TimerState {
  elapsedMs: number;
  focusedMs: number;
  interruptedMs: number;
}

export function useFocusTimer(
  actualStart: number | undefined,
  totalFocusedMs: number,
  totalInterruptedMs: number,
  isRunning: boolean,
  isInterrupted: boolean
) {
  const [state, setState] = useState<TimerState>({
    elapsedMs: 0,
    focusedMs: totalFocusedMs,
    interruptedMs: totalInterruptedMs,
  });

  const frameRef = useRef<number | undefined>(undefined);
  const lastResumeRef = useRef<number | null>(null);
  const lastInterruptionRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!actualStart) return;
    const now = Date.now();
    const elapsed = now - actualStart;

    let focused = totalFocusedMs;
    let interrupted = totalInterruptedMs;

    if (isRunning && !isInterrupted && lastResumeRef.current) {
      focused += now - lastResumeRef.current;
    } else if (isInterrupted && lastInterruptionRef.current) {
      interrupted += now - lastInterruptionRef.current;
    }

    setState({ elapsedMs: elapsed, focusedMs: focused, interruptedMs: interrupted });
    frameRef.current = requestAnimationFrame(tick);
  }, [actualStart, totalFocusedMs, totalInterruptedMs, isRunning, isInterrupted]);

  const start = useCallback((resumeAt?: number, interruptionAt?: number) => {
    lastResumeRef.current = resumeAt ?? Date.now();
    lastInterruptionRef.current = interruptionAt ?? null;
    frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    lastResumeRef.current = null;
    lastInterruptionRef.current = null;
  }, []);

  return { ...state, start, pause, stop };
}
