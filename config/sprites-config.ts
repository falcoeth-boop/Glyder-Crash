import type { ParallaxLayer } from '@/components/crash/ParallaxBackground';

export interface RocketSpriteConfig {
  src: string;
  width: number;
  height: number;
  rotationOffset: number;
}

export interface RocketOverlayConfig {
  src: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  animationSpeed: number;
  opacity: number;
}

export const ROCKET_SPRITE: RocketSpriteConfig | null = {
  src: '/sprites/rocket.png',
  width: 64,
  height: 64,
  rotationOffset: 45,
};

export const ROCKET_OVERLAY: RocketOverlayConfig | null = null;

export const PARALLAX_LAYERS: ParallaxLayer[] = [
  { id: 'layer-1', src: '/sprites/parallax/layer-1.png', speedX: 0.05, speedY: 0.05, zIndex: 1, opacity: 1 },
  { id: 'layer-2', src: '/sprites/parallax/layer-2.png', speedX: 0.1, speedY: 0.1, zIndex: 2, opacity: 1 },
  { id: 'layer-3', src: '/sprites/parallax/layer-3.png', speedX: 0.2, speedY: 0.15, zIndex: 3, opacity: 1 },
  { id: 'layer-4', src: '/sprites/parallax/layer-4.png', speedX: 0.3, speedY: 0.25, zIndex: 4, opacity: 1 },
  { id: 'layer-5', src: '/sprites/parallax/layer-5.png', speedX: 0.45, speedY: 0.4, zIndex: 5, opacity: 1 },
  { id: 'layer-6', src: '/sprites/parallax/layer-6.png', speedX: 0.6, speedY: 0.55, zIndex: 6, opacity: 1 },
  { id: 'layer-7', src: '/sprites/parallax/layer-7.png', speedX: 0.75, speedY: 0.7, zIndex: 7, opacity: 1 },
  { id: 'layer-8', src: '/sprites/parallax/layer-8.png', speedX: 0.9, speedY: 0.85, zIndex: 8, opacity: 1 },
];

export const USE_CUSTOM_PARALLAX = true;

export const FALLBACK_GRADIENT = {
  top: '#020617',
  middle: '#1e1b4b',
  bottom: '#3b0764',
};
