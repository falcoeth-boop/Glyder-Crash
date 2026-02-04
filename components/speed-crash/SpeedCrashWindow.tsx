'use client';

import { memo, useMemo } from 'react';
import type { CrashState } from '@/types';
import Background from '@/components/crash/Background';
import MultiplierScale from '@/components/crash/MultiplierScale';
import { Rocket } from '@/components/crash/Rocket';
import { RocketTrail } from '@/components/crash/RocketTrail';
import { CrashExplosion } from '@/components/crash/CrashExplosion';
import { MultiplierDisplay } from '@/components/crash/MultiplierDisplay';
import { getRocketPosition } from '@/engine/ViewportUtils';

interface SpeedCrashWindowProps {
  currentMultiplier: number;
  targetMultiplier: number;
  crashPoint: number | null;
  state: CrashState;
  elapsedTime: number;
}

function SpeedCrashWindowComponent({
  currentMultiplier,
  targetMultiplier,
  crashPoint,
  state,
  elapsedTime,
}: SpeedCrashWindowProps) {
  const rocketPos = useMemo(() => getRocketPosition(currentMultiplier, elapsedTime), [currentMultiplier, elapsedTime]);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Background
          intensity={1}
          elapsedTime={elapsedTime}
          multiplier={currentMultiplier}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <MultiplierScale
          currentMultiplier={currentMultiplier}
          targetMultiplier={targetMultiplier}
          state={state}
        />
      </div>

      <div className="absolute inset-0 z-15">
        <RocketTrail
          currentMultiplier={currentMultiplier}
          state={state}
          elapsedTime={elapsedTime}
          targetMultiplier={targetMultiplier}
        />
      </div>

      <div className="absolute inset-0 z-20">
        <Rocket
          currentMultiplier={currentMultiplier}
          state={state}
          targetMultiplier={targetMultiplier}
          elapsedTime={elapsedTime}
        />
      </div>

      <div className="absolute inset-0 z-30">
        <CrashExplosion
          state={state}
          position={rocketPos}
          crashPoint={crashPoint ?? undefined}
        />
      </div>

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

const SpeedCrashWindow = memo(SpeedCrashWindowComponent);
export default SpeedCrashWindow;
