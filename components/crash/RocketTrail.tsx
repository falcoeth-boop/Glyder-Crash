'use client';

import { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrashState } from '@/types';
import { timeToMultiplier } from '@/engine/MultiplierCurve';
import { getCachedViewport, getViewportY, getTimeBasedX } from '@/engine/ViewportUtils';

interface Props {
  currentMultiplier: number;
  state: CrashState;
  elapsedTime: number;
  targetMultiplier: number;
}

const TRAIL_POINTS = 40;

function RocketTrailComponent({ currentMultiplier, state, elapsedTime }: Props) {
  const isFlying = state === 'FLYING';
  const isWin = state === 'WIN';
  const isCrashed = state === 'CRASHED';
  const showTrail = isFlying || isWin || isCrashed;

  const viewport = useMemo(() => getCachedViewport(currentMultiplier), [currentMultiplier]);

  const { pathD, fillPath } = useMemo(() => {
    if (!showTrail || elapsedTime <= 0) return { pathD: '', fillPath: '' };

    const points: { x: number; y: number }[] = [];
    const timeStep = elapsedTime / TRAIL_POINTS;

    for (let i = 0; i <= TRAIL_POINTS; i++) {
      const t = i * timeStep;
      const mult = timeToMultiplier(t);
      const x = getTimeBasedX(t);
      const y = 100 - getViewportY(mult, viewport.min, viewport.max);
      points.push({ x, y });
    }

    if (points.length < 2) return { pathD: '', fillPath: '' };

    const pathSegments: string[] = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

    for (let i = 1; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const endX = (curr.x + next.x) / 2;
      const endY = (curr.y + next.y) / 2;
      pathSegments.push(`Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`);
    }

    const lastPoint = points[points.length - 1];
    const secondLast = points[points.length - 2];
    pathSegments.push(`Q ${secondLast.x.toFixed(2)} ${secondLast.y.toFixed(2)} ${lastPoint.x.toFixed(2)} ${lastPoint.y.toFixed(2)}`);

    const pathD = pathSegments.join(' ');
    const fillPath = `${pathD} L ${lastPoint.x.toFixed(2)} 100 L ${points[0].x.toFixed(2)} 100 Z`;

    return { pathD, fillPath };
  }, [elapsedTime, showTrail, viewport.min, viewport.max]);

  if (!showTrail || !pathD) return null;

  return (
    <AnimatePresence>
      <motion.svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 15 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
      >
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
            <stop offset="20%" stopColor="rgba(34, 197, 94, 0.3)" />
            <stop offset="50%" stopColor="rgba(34, 197, 94, 0.6)" />
            <stop offset="80%" stopColor="rgba(74, 222, 128, 0.9)" />
            <stop offset="100%" stopColor="rgba(134, 239, 172, 1)" />
          </linearGradient>
          <linearGradient id="trailFillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
            <stop offset="30%" stopColor="rgba(34, 197, 94, 0.03)" />
            <stop offset="70%" stopColor="rgba(34, 197, 94, 0.08)" />
            <stop offset="100%" stopColor="rgba(74, 222, 128, 0.15)" />
          </linearGradient>
          <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={fillPath} fill="url(#trailFillGradient)" opacity="0.6" />
        <path d={pathD} fill="none" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#trailGlow)" vectorEffect="non-scaling-stroke" />
        <path d={pathD} fill="none" stroke="url(#trailGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#trailGlow)" vectorEffect="non-scaling-stroke" />
        <path d={pathD} fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </motion.svg>
    </AnimatePresence>
  );
}

export const RocketTrail = memo(RocketTrailComponent);
