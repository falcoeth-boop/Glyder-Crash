'use client';

import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrashState } from '@/types';
import { ROCKET_SPRITE, ROCKET_OVERLAY } from '@/config/sprites-config';
import { getCachedViewport, getViewportY, getTimeBasedX, TIME_CONFIG } from '@/engine/ViewportUtils';

interface Props {
  currentMultiplier: number;
  state: CrashState;
  targetMultiplier: number;
  elapsedTime: number;
}

function getRotation(
  multiplier: number,
  prevMultiplier: number,
  viewport: { min: number; max: number },
  elapsedTime: number,
  prevTime: number
): number {
  const rotationOffset = ROCKET_SPRITE?.rotationOffset ?? 45;
  if (multiplier <= 1.01) return rotationOffset;

  const x1 = getTimeBasedX(prevTime);
  const y1 = getViewportY(prevMultiplier, viewport.min, viewport.max);
  const x2 = getTimeBasedX(elapsedTime);
  const y2 = getViewportY(multiplier, viewport.min, viewport.max);

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    if (elapsedTime >= TIME_CONFIG.travelDuration) {
      return rotationOffset - 45 + 90;
    }
    return rotationOffset;
  }

  const angleRad = Math.atan2(dy, dx);
  const angleDeg = angleRad * (180 / Math.PI);
  return rotationOffset - 45 + angleDeg;
}

const TRAIL_COLORS = [
  'rgba(255, 255, 200, 1)',
  'rgba(255, 230, 100, 1)',
  'rgba(255, 200, 60, 0.95)',
  'rgba(255, 160, 30, 0.9)',
  'rgba(255, 120, 15, 0.85)',
  'rgba(255, 80, 5, 0.75)',
  'rgba(240, 50, 0, 0.6)',
  'rgba(220, 30, 0, 0.45)',
  'rgba(200, 20, 0, 0.3)',
  'rgba(180, 10, 0, 0.2)',
];

function RocketComponent({ currentMultiplier, state, targetMultiplier, elapsedTime }: Props) {
  const isIdle = state === 'IDLE' || state === 'BETTING';
  const isLaunching = state === 'LAUNCHING';
  const isFlying = state === 'FLYING';
  const isWin = state === 'WIN';
  const isCrashed = state === 'CRASHED';

  const prevMultiplierRef = useRef(1);
  const prevTimeRef = useRef(0);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (currentMultiplier > 1) {
      prevMultiplierRef.current = Math.max(1, currentMultiplier - 0.05);
      prevTimeRef.current = Math.max(0, elapsedTime - 0.05);
    }
  }, [currentMultiplier, elapsedTime]);

  useEffect(() => {
    if (!ROCKET_OVERLAY) return;
    const interval = setInterval(() => setOverlayVisible((v) => !v), ROCKET_OVERLAY.animationSpeed);
    return () => clearInterval(interval);
  }, []);

  const viewport = useMemo(() => getCachedViewport(currentMultiplier), [currentMultiplier]);
  const active = isFlying || isWin;

  const xPercent = active ? getTimeBasedX(elapsedTime) : TIME_CONFIG.startX;
  const yPercent = active ? getViewportY(currentMultiplier, viewport.min, viewport.max) : 0;
  const rotation = active ? getRotation(currentMultiplier, prevMultiplierRef.current, viewport, elapsedTime, prevTimeRef.current) : 0;

  const showExhaust = isLaunching || isFlying || isWin;
  const showRocket = !isCrashed && !isIdle;
  const nearTarget = isFlying && targetMultiplier > 1 && currentMultiplier >= targetMultiplier * 0.8;
  const spriteSize = ROCKET_SPRITE ? Math.max(ROCKET_SPRITE.width, ROCKET_SPRITE.height) : 48;

  return (
    <AnimatePresence>
      {showRocket && (
        <motion.div
          className="absolute pointer-events-none z-30"
          style={{
            left: `${xPercent}%`,
            bottom: `${yPercent}%`,
            transform: `rotate(${rotation}deg)`,
            willChange: 'left, bottom, transform',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLaunching ? 0.7 : 1, scale: isWin ? 1.15 : 1 }}
          exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.15 } }}
          transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.2 } }}
        >
          <motion.div
            animate={
              isLaunching
                ? { x: [0, -2, 2, -3, 3, -2, 2, -1, 1, 0], y: [0, 1, -1, 2, -2, 1, -1, 0.5, -0.5, 0], scale: [1, 1.02, 0.98, 1.03, 0.97, 1.02, 0.98, 1.01, 0.99, 1] }
                : isFlying
                  ? { y: [0, -1, 0, 1, 0] }
                  : { x: 0, y: 0 }
            }
            transition={
              isLaunching
                ? { duration: 0.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
                : isFlying
                  ? { duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }
                  : { duration: 0.1 }
            }
          >
            {(isWin || nearTarget) && (
              <motion.div
                className="absolute -inset-6 rounded-full"
                style={{
                  background: isWin
                    ? 'radial-gradient(circle, rgba(34,197,94,0.6) 0%, rgba(74,222,128,0.3) 40%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(250,204,21,0.4) 0%, rgba(234,179,8,0.2) 40%, transparent 70%)',
                }}
                animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.85, 1.15, 0.85] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div className="relative" style={{ width: spriteSize, height: spriteSize }}>
              {ROCKET_OVERLAY && showExhaust && (
                <motion.img
                  src={ROCKET_OVERLAY.src}
                  alt=""
                  width={ROCKET_OVERLAY.width}
                  height={ROCKET_OVERLAY.height}
                  className="absolute object-contain pointer-events-none"
                  style={{
                    left: spriteSize / 2 + ROCKET_OVERLAY.offsetX - ROCKET_OVERLAY.width / 2,
                    top: spriteSize / 2 + ROCKET_OVERLAY.offsetY - ROCKET_OVERLAY.height / 2,
                    opacity: overlayVisible ? ROCKET_OVERLAY.opacity : ROCKET_OVERLAY.opacity * 0.6,
                  }}
                  animate={{ scale: overlayVisible ? 1 : 0.9, opacity: overlayVisible ? ROCKET_OVERLAY.opacity : ROCKET_OVERLAY.opacity * 0.5 }}
                  transition={{ duration: ROCKET_OVERLAY.animationSpeed / 1000 }}
                  draggable={false}
                />
              )}

              {ROCKET_SPRITE ? (
                <img
                  src={ROCKET_SPRITE.src}
                  alt=""
                  width={ROCKET_SPRITE.width}
                  height={ROCKET_SPRITE.height}
                  className="w-full h-full object-contain relative z-10"
                  style={{ filter: isWin ? 'drop-shadow(0 0 8px #22c55e)' : undefined }}
                  draggable={false}
                />
              ) : (
                <span className="text-4xl select-none block" style={{ filter: isWin ? 'drop-shadow(0 0 8px #22c55e)' : undefined }}>
                  🚀
                </span>
              )}
            </div>

            <AnimatePresence>
              {showExhaust &&
                Array.from({ length: 10 }, (_, i) => {
                  const size = Math.max(4, 16 - i * 1.2);
                  const opacity = 1 - (i / 10) * 0.7;
                  const color = TRAIL_COLORS[i];

                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: size,
                        height: size,
                        left: spriteSize / 2 - 10 - i * 6,
                        top: spriteSize / 2 + i * 3,
                        background: `radial-gradient(circle, ${color}, transparent 70%)`,
                        boxShadow: `0 0 ${size * 1.2}px ${size / 2}px ${color}`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [opacity, opacity * 0.6, opacity * 0.2],
                        scale: [0.5, 1.1, 0.3],
                        x: [0, -2 + Math.random() * 4, 0],
                        y: [0, 1 + Math.random() * 2, 0],
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.4 + i * 0.04, repeat: Infinity, repeatType: 'loop', delay: i * 0.025, ease: 'easeOut' }}
                    />
                  );
                })}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Rocket = memo(RocketComponent);
