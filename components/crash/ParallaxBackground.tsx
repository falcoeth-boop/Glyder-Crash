'use client';

import { memo } from 'react';

export interface ParallaxLayer {
  id: string;
  src: string;
  speedX: number;
  speedY: number;
  zIndex: number;
  opacity?: number;
}

interface ParallaxBackgroundProps {
  layers: ParallaxLayer[];
  multiplier: number;
  elapsedTime: number;
  rocketY?: number;
}

function ParallaxBackgroundComponent({
  layers,
  multiplier,
  elapsedTime,
  rocketY = 0,
}: ParallaxBackgroundProps) {
  const getScrollX = (speedX: number): number => {
    return elapsedTime * speedX * 50;
  };

  const getScrollY = (speedY: number): number => {
    if (multiplier <= 1) return 0;
    const rocketOffset = (rocketY - 10) * 0.3;
    return Math.log(multiplier) * 100 * speedY + rocketOffset * speedY;
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {layers
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer) => {
          const scrollX = getScrollX(layer.speedX);
          const scrollY = getScrollY(layer.speedY);

          return (
            <div
              key={layer.id}
              className="absolute inset-0"
              style={{
                zIndex: layer.zIndex,
                opacity: layer.opacity ?? 1,
                backgroundImage: `url(${layer.src})`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%',
                backgroundPosition: `${-scrollX}px bottom`,
                transform: `translateY(${scrollY}px)`,
                imageRendering: 'pixelated',
              }}
            />
          );
        })}
    </div>
  );
}

export const ParallaxBackground = memo(ParallaxBackgroundComponent);
