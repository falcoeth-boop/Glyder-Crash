/**
 * Viewport utilities for rocket and trail positioning.
 */

export const VIEWPORT_CONFIG = {
  minValue: 1,
  maxValue: 1000,
  initialMax: 2,
  /** Target screen position for the current multiplier (0-1). 
   *  0.9 means the rocket stays at ~90% height once past initialMax. */
  targetPosition: 0.9,
} as const;

export const TIME_CONFIG = {
  travelDuration: 3,
  startX: 8,
  endX: 90,
} as const;

export interface Viewport {
  min: number;
  max: number;
}

export function calculateViewport(currentMultiplier: number): Viewport {
  const min = VIEWPORT_CONFIG.minValue;

  // Smoothly expand viewport so the current multiplier stays at ~targetPosition (75%) of the range.
  // requiredMax = min + (currentMultiplier - min) / targetPosition
  // This is continuous — no discrete jumps.
  const requiredMax = min + (currentMultiplier - min) / VIEWPORT_CONFIG.targetPosition;
  const max = Math.max(VIEWPORT_CONFIG.initialMax, requiredMax);

  return { min, max: Math.min(max, VIEWPORT_CONFIG.maxValue) };
}

export function getViewportY(multiplier: number, viewMin: number, viewMax: number): number {
  if (multiplier <= viewMin) return 0;
  if (multiplier >= viewMax) return 100;
  return ((multiplier - viewMin) / (viewMax - viewMin)) * 100;
}

export function getTimeBasedX(elapsedTime: number): number {
  if (elapsedTime <= 0) return TIME_CONFIG.startX;
  if (elapsedTime >= TIME_CONFIG.travelDuration) return TIME_CONFIG.endX;

  const progress = elapsedTime / TIME_CONFIG.travelDuration;
  const eased = 1 - Math.pow(1 - progress, 2);

  return TIME_CONFIG.startX + eased * (TIME_CONFIG.endX - TIME_CONFIG.startX);
}

export function getRocketPosition(multiplier: number, elapsedTime: number): { x: number; y: number } {
  const viewport = calculateViewport(multiplier);
  return {
    x: getTimeBasedX(elapsedTime),
    y: getViewportY(multiplier, viewport.min, viewport.max),
  };
}

let cachedViewport: { multiplier: number; viewport: Viewport } | null = null;

export function getCachedViewport(currentMultiplier: number): Viewport {
  if (cachedViewport && Math.abs(cachedViewport.multiplier - currentMultiplier) < 0.001) {
    return cachedViewport.viewport;
  }
  const viewport = calculateViewport(currentMultiplier);
  cachedViewport = { multiplier: currentMultiplier, viewport };
  return viewport;
}

export function resetViewportCache(): void {
  cachedViewport = null;
}
