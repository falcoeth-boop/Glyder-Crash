'use client';

import { memo } from 'react';
import { PARALLAX_LAYERS, USE_CUSTOM_PARALLAX, FALLBACK_GRADIENT } from '@/config/sprites-config';
import { ParallaxBackground } from './ParallaxBackground';

interface BackgroundProps {
  intensity?: number;
  elapsedTime?: number;
  multiplier?: number;
}

function BackgroundComponent({
  intensity = 1,
  elapsedTime = 0,
  multiplier = 1,
}: BackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            ${FALLBACK_GRADIENT.top} 0%,
            ${FALLBACK_GRADIENT.middle} 50%,
            ${FALLBACK_GRADIENT.bottom} 100%)`,
          opacity: intensity,
        }}
      />

      {USE_CUSTOM_PARALLAX && (
        <ParallaxBackground
          layers={PARALLAX_LAYERS}
          multiplier={multiplier}
          elapsedTime={elapsedTime}
        />
      )}
    </div>
  );
}

const Background = memo(BackgroundComponent);
export default Background;
