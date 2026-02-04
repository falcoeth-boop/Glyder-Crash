import { CRASH_CONFIG } from '@/config/crash-config';

/**
 * Generate a crash point using the standard crash game formula.
 * Uses house edge to ensure long-term profitability.
 *
 * Distribution properties (with 3% house edge):
 * - ~3% of rounds crash at 1.00x (instant crash)
 * - Median crash ~2.0x
 * - 1% chance of 100x+
 * - Exponential distribution
 */
export function generateCrashPoint(): number {
  const e = Math.random();
  const houseEdge = CRASH_CONFIG.houseEdge;
  
  // Standard crash formula: max(1, floor(100 / (e * 100)) * (1 - houseEdge))
  // Simplified: if e < houseEdge, instant crash at 1.00
  if (e < houseEdge) {
    return 1.0;
  }
  
  // Otherwise, exponential distribution
  const crashPoint = (1 - houseEdge) / (1 - e);
  
  // Round to 2 decimal places, minimum 1.00
  return Math.max(1.0, Math.floor(crashPoint * 100) / 100);
}

/**
 * Determine if the player wins given their target and the crash point.
 */
export function resolveRound(
  crashPoint: number,
  targetMultiplier: number,
  betAmount: number
): { won: boolean; winAmount: number } {
  const won = crashPoint >= targetMultiplier;
  const winAmount = won ? Math.floor(betAmount * targetMultiplier * 100) / 100 : 0;
  return { won, winAmount };
}
