'use client';

import { useMemo } from 'react';
import type { CrashState } from '@/types';
import Background from './Background';
import MultiplierScale from './MultiplierScale';
import { Rocket } from './Rocket';
import { RocketTrail } from './RocketTrail';
import { CrashExplosion } from './CrashExplosion';
import { MultiplierDisplay } from './MultiplierDisplay';

interface RocketSceneProps {
  currentMultiplier: number;
  targetMultiplier: number;
  crashPoint: number | null;
  state: CrashState;
  elapsedTime: number;
}

// Match rocket's exponential X position calculation
function getX(multiplier: number): number {
  const baseX = 8;
  const maxX = 70;
  if (multiplier <= 1) return baseX;
  const normalized = Math.min(1, (multiplier - 1) / 49);
  const curved = Math.pow(normalized, 0.6);
  return baseX + curved * (maxX - baseX);
}

// Match rocket's exponential Y position calculation
function getY(multiplier: number): number {
  const baseY = 10;
  const maxY = 80;
  if (multiplier <= 1) return baseY;
  const normalized = Math.min(1, (multiplier - 1) / 49);
  const curved = Math.pow(normalized, 0.7);
  return baseY + curved * (maxY - baseY);
}

function getRocketPosition(multiplier: number, elapsedTime: number): { x: number; y: number } {
  return { x: getX(multiplier), y: getY(multiplier) };
}

export function RocketScene({
  currentMultiplier,
  targetMultiplier,
  crashPoint,
  state,
  elapsedTime,
}: RocketSceneProps) {
  const explosionPosition = useMemo(() => {
    return getRocketPosition(currentMultiplier, elapsedTime);
  }, [currentMultiplier, elapsedTime]);

  // Calculate rocket position
  const rocketPos = getRocketPosition(currentMultiplier, elapsedTime);

  const normalizedY = Math.min(1, (currentMultiplier - 1) / 49);
  const bgIntensity =
    state === 'FLYING'
      ? Math.min(1, 0.5 + normalizedY * 0.5)
      : 1;

  return (
    <div className="relative w-full max-w-lg aspect-[3/4] min-h-[400px] overflow-hidden rounded-2xl border border-purple-500/20">
      {/* Layer 1: Background with parallax */}
      <div className="absolute inset-0 z-0">
        <Background
          intensity={bgIntensity}
          elapsedTime={elapsedTime}
          multiplier={currentMultiplier}
          rocketY={rocketPos.y}
        />
      </div>

      {/* Layer 2: Multiplier Scale */}
      <div className="absolute inset-0 z-10">
        <MultiplierScale
          currentMultiplier={currentMultiplier}
          targetMultiplier={targetMultiplier}
          state={state}
        />
      </div>

      {/* Layer 3: Rocket Trail (path line) */}
      <div className="absolute inset-0 z-15">
        <RocketTrail
          currentMultiplier={currentMultiplier}
          state={state}
          elapsedTime={elapsedTime}
          targetMultiplier={targetMultiplier}
        />
      </div>

      {/* Layer 4: Rocket */}
      <div className="absolute inset-0 z-20">
        <Rocket
          currentMultiplier={currentMultiplier}
          state={state}
          targetMultiplier={targetMultiplier}
          elapsedTime={elapsedTime}
        />
      </div>

      {/* Layer 5: Crash/Win Explosion */}
      <div className="absolute inset-0 z-30">
        <CrashExplosion
          state={state}
          position={explosionPosition}
          crashPoint={crashPoint ?? undefined}
        />
      </div>

      {/* Layer 6: Multiplier Display */}
      <div className="absolute inset-0 z-40">
        <MultiplierDisplay
          currentMultiplier={currentMultiplier}
          targetMultiplier={targetMultiplier}
          state={state}
          crashPoint={crashPoint ?? undefined}
        />
      </div>
    </div>
  );
}
