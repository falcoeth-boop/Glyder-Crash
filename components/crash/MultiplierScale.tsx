'use client';

import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMultiplier } from '@/engine/MultiplierCurve';
import type { CrashState } from '@/types';
import { getCachedViewport, getViewportY } from '@/engine/ViewportUtils';

interface MultiplierScaleProps {
  currentMultiplier: number;
  targetMultiplier: number;
  state: CrashState;
}

// Thresholds for label style changes
const LABEL_THRESHOLDS = [
  { maxView: 2, step: 0.2 },      // 1x, 1.2x, 1.4x, 1.6x, 1.8x, 2x
  { maxView: 5, step: 1 },        // 2x, 3x, 4x, 5x
  { maxView: 10, step: 2 },       // 2x, 4x, 6x, 8x, 10x
  { maxView: 20, step: 5 },       // 5x, 10x, 15x, 20x
  { maxView: 50, step: 10 },      // 10x, 20x, 30x, 40x, 50x
  { maxView: 100, step: 25 },     // 25x, 50x, 75x, 100x
  { maxView: 200, step: 50 },     // 50x, 100x, 150x, 200x
  { maxView: 500, step: 100 },    // 100x, 200x, 300x, 400x, 500x
  { maxView: 1000, step: 250 },   // 250x, 500x, 750x, 1000x
];

// Generate labels based on current viewport range
function generateScaleLabels(viewMin: number, viewMax: number): number[] {
  const labels: number[] = [];

  // Find appropriate step for current viewport
  let step = 0.2; // Default for initial 1-2x range
  for (const threshold of LABEL_THRESHOLDS) {
    if (viewMax <= threshold.maxView) {
      step = threshold.step;
      break;
    }
  }

  // Generate labels
  const startLabel = Math.ceil(viewMin / step) * step;
  for (let val = startLabel; val <= viewMax + 0.001; val += step) {
    if (val >= viewMin) {
      labels.push(Math.round(val * 100) / 100);
    }
  }

  // Always include 1x if in range
  if (viewMin <= 1 && !labels.includes(1)) {
    labels.unshift(1);
  }

  // Always include the max value
  if (!labels.includes(viewMax)) {
    labels.push(viewMax);
  }

  return labels;
}

// Format label for display
function formatLabel(value: number): string {
  if (value >= 10) return `${value.toFixed(0)}x`;
  if (value % 1 === 0) return `${value.toFixed(0)}x`;
  return `${value.toFixed(1)}x`;
}

function MultiplierScaleComponent({
  currentMultiplier,
  targetMultiplier,
  state,
}: MultiplierScaleProps) {
  const isActive = state === 'FLYING' || state === 'WIN' || state === 'CRASHED';

  // Use shared cached viewport for consistency with other components
  const viewport = useMemo(() => {
    return getCachedViewport(currentMultiplier);
  }, [currentMultiplier]);

  // Generate labels for current viewport
  const scaleLabels = useMemo(() => {
    return generateScaleLabels(viewport.min, viewport.max);
  }, [viewport.min, viewport.max]);

  // Calculate positions using shared utility
  const currentY = getViewportY(currentMultiplier, viewport.min, viewport.max);
  const targetY = getViewportY(targetMultiplier, viewport.min, viewport.max);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-16 flex flex-col justify-between pointer-events-none select-none z-10">
      <div className="relative h-full">
        {/* Scale labels */}
        <AnimatePresence mode="popLayout">
          {scaleLabels.map((label) => {
            const bottomPercent = getViewportY(label, viewport.min, viewport.max);

            // Fade labels near edges for smooth appearance
            const edgeFade = Math.min(bottomPercent / 20, (100 - bottomPercent) / 20, 1);
            const opacity = Math.max(0.5, edgeFade) * 0.8;

            return (
              <motion.div
                key={`label-${label}`}
                className="absolute right-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  bottom: `${bottomPercent}%`,
                  transform: 'translateY(50%)',
                }}
              >
                <span className="text-xs font-mono text-emerald-400/80">
                  {formatLabel(label)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Horizontal grid lines */}
        <div className="absolute inset-0 overflow-hidden">
          {scaleLabels.map((label) => {
            const bottomPercent = getViewportY(label, viewport.min, viewport.max);
            const edgeFade = Math.min(bottomPercent / 25, (100 - bottomPercent) / 25, 1);

            return (
              <motion.div
                key={`grid-${label}`}
                className="absolute left-0 right-16 h-px"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  bottom: `${bottomPercent}%`,
                  background: `linear-gradient(to right, rgba(52, 211, 153, ${edgeFade * 0.06}), rgba(52, 211, 153, ${edgeFade * 0.12}), rgba(52, 211, 153, ${edgeFade * 0.06}))`,
                }}
              />
            );
          })}
        </div>

        {/* Target multiplier line (position based on viewport, but doesn't affect scale) */}
        {targetMultiplier > 1 && targetY > 0 && targetY <= 100 && (
          <motion.div
            className="absolute right-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              left: '-100vw',
              width: '200vw',
              bottom: `${targetY}%`,
              transform: 'translateY(50%)',
            }}
          >
            <div className="border-t-2 border-dashed border-amber-400/60" />
            <span className="absolute right-2 top-1 text-xs font-mono text-amber-400 whitespace-nowrap">
              {formatMultiplier(targetMultiplier)}
            </span>
          </motion.div>
        )}

        {/* Current multiplier indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute right-1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                bottom: `${currentY}%`,
                transform: 'translateY(50%)',
              }}
            >
              <div className="relative">
                <motion.div
                  className="w-3 h-3 rounded-full bg-emerald-400"
                  animate={{
                    boxShadow: [
                      '0 0 8px 2px rgba(52, 211, 153, 0.6)',
                      '0 0 14px 4px rgba(52, 211, 153, 0.8)',
                      '0 0 8px 2px rgba(52, 211, 153, 0.6)',
                    ],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Horizontal line to rocket */}
                <div
                  className="absolute top-1/2 right-full -translate-y-1/2 h-px"
                  style={{
                    width: '100vw',
                    background: 'linear-gradient(to left, rgba(52, 211, 153, 0.6), rgba(52, 211, 153, 0.3), transparent)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
const MultiplierScale = memo(MultiplierScaleComponent);
export default MultiplierScale;

// Re-export viewport utilities from shared module for backwards compatibility
export { getCachedViewport as calculateViewport, getViewportY } from '@/engine/ViewportUtils';
