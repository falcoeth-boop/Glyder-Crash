/**
 * Viewport utilities for rocket and trail positioning.
 */

export const VIEWPORT_CONFIG = {
  minValue: 1,
  maxValue: 1000,
  initialMax: 2,
  unzoomThreshold: 0.85,
} as const;

export const TIME_CONFIG = {
  travelDuration: 3,
  startX: 8,
  endX: 75,
} as const;

export interface Viewport {
  min: number;
  max: number;
}

export function calculateViewport(currentMultiplier: number): Viewport {
  const min = VIEWPORT_CONFIG.minValue;
  let max: number = VIEWPORT_CONFIG.initialMax;

  while (currentMultiplier > min + (max - min) * VIEWPORT_CONFIG.unzoomThreshold) {
    if (max < 5) max = 5;
    else if (max < 10) max = 10;
    else if (max < 20) max = 20;
    else if (max < 50) max = 50;
    else if (max < 100) max = 100;
    else if (max < 200) max = 200;
    else if (max < 500) max = 500;
    else max = VIEWPORT_CONFIG.maxValue;

    if (max >= VIEWPORT_CONFIG.maxValue) break;
  }

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
