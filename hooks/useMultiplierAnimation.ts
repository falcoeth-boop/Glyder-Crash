'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { timeToMultiplier } from '@/engine/MultiplierCurve';
import { resetViewportCache } from '@/engine/ViewportUtils';

interface UseMultiplierAnimationArgs {
  crashPoint: number;
  targetMultiplier: number;
  isFlying: boolean;
  speedMultiplier?: number;
  onReachTarget: () => void;
  onReachCrash: () => void;
}

interface UseMultiplierAnimationReturn {
  currentMultiplier: number;
  elapsedTime: number;
}

/**
 * High-performance 60fps rAF-based animation hook that drives the multiplier climb.
 *
 * Optimizations:
 * - Uses refs for all intermediate values to avoid re-render triggers
 * - Only updates state when values actually change
 * - Batches multiplier and time updates together
 * - Pre-computes win/crash thresholds for faster checks
 *
 * The crash point is pre-determined — this hook just reveals it visually.
 */
export function useMultiplierAnimation({
  crashPoint,
  targetMultiplier,
  isFlying,
  speedMultiplier = 1,
  onReachTarget,
  onReachCrash,
}: UseMultiplierAnimationArgs): UseMultiplierAnimationReturn {
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Store props in refs so the rAF callback always reads latest values
  const crashPointRef = useRef(crashPoint);
  const targetRef = useRef(targetMultiplier);
  const speedRef = useRef(speedMultiplier);
  const onReachTargetRef = useRef(onReachTarget);
  const onReachCrashRef = useRef(onReachCrash);

  // Keep refs updated
  crashPointRef.current = crashPoint;
  targetRef.current = targetMultiplier;
  speedRef.current = speedMultiplier;
  onReachTargetRef.current = onReachTarget;
  onReachCrashRef.current = onReachCrash;

  // Animation internals
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const resolvedRef = useRef(false);
  const lastRenderedMultRef = useRef(1.0);

  useEffect(() => {
    if (!isFlying) {
      // Stop the loop, hold currentMultiplier at its last value
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    // Reset for a new flight
    elapsedRef.current = 0;
    resolvedRef.current = false;
    lastRenderedMultRef.current = 1.0;
    resetViewportCache(); // Clear any cached viewport calculations
    setCurrentMultiplier(1.0);
    setElapsedTime(0);
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const deltaTime = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      elapsedRef.current += deltaTime * speedRef.current;
      const mult = timeToMultiplier(elapsedRef.current);

      if (!resolvedRef.current) {
        const cp = crashPointRef.current;
        const tm = targetRef.current;

        // Win check: multiplier reached target AND crash point supports it
        if (mult >= tm && cp >= tm) {
          resolvedRef.current = true;
          const finalMult = Math.floor(tm * 100) / 100;
          setCurrentMultiplier(finalMult);
          setElapsedTime(elapsedRef.current);
          lastRenderedMultRef.current = finalMult;
          onReachTargetRef.current();
          return; // stop loop
        }

        // Crash check: multiplier reached crash point AND it's below target
        if (mult >= cp && cp < tm) {
          resolvedRef.current = true;
          const finalMult = Math.floor(cp * 100) / 100;
          setCurrentMultiplier(finalMult);
          setElapsedTime(elapsedRef.current);
          lastRenderedMultRef.current = finalMult;
          onReachCrashRef.current();
          return; // stop loop
        }
      }

      // Only update state if the multiplier changed enough to be visible
      // This reduces unnecessary re-renders while maintaining smooth animation
      const roundedMult = Math.floor(mult * 100) / 100;
      if (roundedMult !== lastRenderedMultRef.current) {
        lastRenderedMultRef.current = roundedMult;
        setCurrentMultiplier(mult);
        setElapsedTime(elapsedRef.current);
      } else {
        // Still update time for trail animation even if multiplier display hasn't changed
        setElapsedTime(elapsedRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlying]);

  return { currentMultiplier, elapsedTime };
}
