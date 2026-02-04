'use client';

import React, { memo, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrashState } from '@/types';
import { formatMultiplier } from '@/engine/MultiplierCurve';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  currentMultiplier: number;
  targetMultiplier: number;
  state: CrashState;
  crashPoint?: number;
}

/* ------------------------------------------------------------------ */
/*  Sub-components for each state                                      */
/* ------------------------------------------------------------------ */

function IdleDisplay() {
  return (
    <motion.div
      key="idle"
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-2xl font-bold text-white/30 tracking-wider uppercase">
        Set Target
      </p>
    </motion.div>
  );
}

function BettingDisplay({ targetMultiplier }: { targetMultiplier: number }) {
  return (
    <motion.div
      key="betting"
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-lg font-medium text-white/50 uppercase tracking-wider mb-1">
        Target
      </p>
      <p className="text-4xl font-bold text-amber-400">
        {formatMultiplier(targetMultiplier)}
      </p>
    </motion.div>
  );
}

function LaunchingDisplay() {
  return (
    <motion.div
      key="launching"
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.3 }}
    >
      <motion.p
        className="text-3xl font-bold text-amber-400 uppercase tracking-widest"
        animate={{
          opacity: [1, 0.5, 1],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        Launching...
      </motion.p>
    </motion.div>
  );
}

// Milestones that trigger pulse effect
const MILESTONES = [2, 3, 5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 500, 1000];

// Get color based on multiplier and target
function getMultiplierColor(multiplier: number, target: number): {
  color: string;
  shadow: string;
  bgGlow: string;
} {
  const progress = target > 1 ? multiplier / target : multiplier / 10;

  // Approaching target - green
  if (target > 1 && multiplier >= target * 0.8) {
    return {
      color: '#4ade80', // green-400
      shadow: '0 0 30px rgba(74, 222, 128, 0.7), 0 0 60px rgba(74, 222, 128, 0.4)',
      bgGlow: 'rgba(74, 222, 128, 0.15)',
    };
  }

  // Color gradient based on multiplier value
  if (multiplier < 1.5) {
    return {
      color: '#ffffff',
      shadow: '0 0 10px rgba(255, 255, 255, 0.2)',
      bgGlow: 'transparent',
    };
  } else if (multiplier < 2) {
    return {
      color: '#a3e635', // lime-400
      shadow: '0 0 15px rgba(163, 230, 53, 0.5)',
      bgGlow: 'rgba(163, 230, 53, 0.1)',
    };
  } else if (multiplier < 5) {
    return {
      color: '#facc15', // yellow-400
      shadow: '0 0 20px rgba(250, 204, 21, 0.6)',
      bgGlow: 'rgba(250, 204, 21, 0.1)',
    };
  } else if (multiplier < 10) {
    return {
      color: '#fb923c', // orange-400
      shadow: '0 0 25px rgba(251, 146, 60, 0.6)',
      bgGlow: 'rgba(251, 146, 60, 0.15)',
    };
  } else if (multiplier < 25) {
    return {
      color: '#f87171', // red-400
      shadow: '0 0 30px rgba(248, 113, 113, 0.7)',
      bgGlow: 'rgba(248, 113, 113, 0.15)',
    };
  } else {
    return {
      color: '#c084fc', // purple-400
      shadow: '0 0 35px rgba(192, 132, 252, 0.8), 0 0 70px rgba(192, 132, 252, 0.4)',
      bgGlow: 'rgba(192, 132, 252, 0.2)',
    };
  }
}

// Check if we just crossed a milestone
function checkMilestone(current: number, prev: number): number | null {
  for (const milestone of MILESTONES) {
    if (prev < milestone && current >= milestone) {
      return milestone;
    }
  }
  return null;
}

function FlyingDisplay({
  currentMultiplier,
  targetMultiplier,
}: {
  currentMultiplier: number;
  targetMultiplier: number;
}) {
  const prevMultiplierRef = useRef(1);
  const { color, shadow, bgGlow } = getMultiplierColor(currentMultiplier, targetMultiplier);
  const approaching = targetMultiplier > 1 && currentMultiplier >= targetMultiplier * 0.8;

  // Optimized milestone detection - only check when crossing boundary
  const isMilestone = useMemo(() => {
    const prev = prevMultiplierRef.current;
    prevMultiplierRef.current = currentMultiplier;
    return checkMilestone(currentMultiplier, prev) !== null;
  }, [currentMultiplier]);

  return (
    <motion.div
      key="flying"
      className="text-center relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 -inset-x-20 -inset-y-10 rounded-full blur-3xl"
        animate={{
          backgroundColor: bgGlow,
          scale: isMilestone ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Multiplier value */}
      <motion.p
        className="text-6xl sm:text-7xl font-black tabular-nums relative"
        style={{
          color,
          textShadow: shadow,
        }}
        animate={{
          scale: isMilestone ? [1, 1.15, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: isMilestone ? 0.3 : 0.6,
          repeat: isMilestone ? 0 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {formatMultiplier(currentMultiplier)}
      </motion.p>

      {/* Target indicator */}
      <motion.p
        className="text-sm mt-2 relative"
        animate={{
          color: approaching ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 255, 255, 0.4)',
        }}
      >
        Target: {formatMultiplier(targetMultiplier)}
      </motion.p>

      {/* Milestone flash effect */}
      {isMilestone && (
        <motion.div
          className="absolute inset-0 -inset-x-20 -inset-y-10 rounded-full"
          initial={{ opacity: 0.8, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}

function WinDisplay({
  currentMultiplier,
  targetMultiplier,
}: {
  currentMultiplier: number;
  targetMultiplier: number;
}) {
  return (
    <motion.div
      key="win"
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
    >
      <motion.p
        className="text-5xl sm:text-6xl font-black text-green-400"
        style={{
          textShadow:
            '0 0 20px rgba(34,197,94,0.7), 0 0 40px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.2)',
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        WIN!
      </motion.p>
      <p className="text-3xl font-bold text-green-300 mt-2">
        {formatMultiplier(targetMultiplier)}
      </p>
    </motion.div>
  );
}

function CrashedDisplay({ crashPoint }: { crashPoint?: number }) {
  return (
    <motion.div
      key="crashed"
      className="text-center"
      initial={{ opacity: 0, scale: 1.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{
          x: [0, -4, 4, -3, 3, -1, 0],
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <p
          className="text-5xl sm:text-6xl font-black text-red-500"
          style={{
            textShadow:
              '0 0 20px rgba(239,68,68,0.7), 0 0 40px rgba(239,68,68,0.4)',
          }}
        >
          CRASHED
        </p>
        {crashPoint != null && (
          <p className="text-3xl font-bold text-red-400 mt-2">
            {formatMultiplier(crashPoint)}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

function MultiplierDisplayComponent({
  currentMultiplier,
  targetMultiplier,
  state,
  crashPoint,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <AnimatePresence mode="wait">
        {state === 'IDLE' && <IdleDisplay />}
        {state === 'BETTING' && (
          <BettingDisplay targetMultiplier={targetMultiplier} />
        )}
        {state === 'LAUNCHING' && <LaunchingDisplay />}
        {state === 'FLYING' && (
          <FlyingDisplay
            currentMultiplier={currentMultiplier}
            targetMultiplier={targetMultiplier}
          />
        )}
        {state === 'WIN' && (
          <WinDisplay
            currentMultiplier={currentMultiplier}
            targetMultiplier={targetMultiplier}
          />
        )}
        {state === 'CRASHED' && <CrashedDisplay crashPoint={crashPoint} />}
      </AnimatePresence>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const MultiplierDisplay = memo(MultiplierDisplayComponent);
