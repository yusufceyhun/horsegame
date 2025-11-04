/**
 * Core race calculation engine
 * Implements the race algorithm with condition-based performance, distance suitability, and randomness
 */

import type { Horse } from '@/types'

/**
 * Calculate distance suitability modifier
 * Horses perform differently at various distances based on their ID-based "specialty"
 */
export function calculateDistanceSuitability(horse: Horse, distance: number): number {
  // Use horse ID hash to determine optimal distance
  const hashCode = horse.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const optimalDistance = 1200 + (hashCode % 1100) // Between 1200-2300m

  // Performance decreases as distance deviates from optimal
  const deviation = Math.abs(distance - optimalDistance)
  const suitability = Math.max(0.7, 1 - deviation / 2000)

  return suitability
}

/**
 * Calculate horse speed based on condition and distance
 * Returns meters per second
 * 
 * Balanced for competitive, close races
 */
export function calculateHorseSpeed(horse: Horse, distance: number): number {
  const baseSpeed = (horse.condition / 100) * 45 // Max 45 m/s for perfect condition

  // Distance modifier - some horses perform better at certain distances
  const distanceModifier = calculateDistanceSuitability(horse, distance)

  // Slightly wider random factor (±15%) to avoid clustered results across rounds
  const randomFactor = 0.85 + Math.random() * 0.3

  // Ensure minimum competitive speed (no horse is too slow)
  let finalSpeed = baseSpeed * distanceModifier * randomFactor
  const minSpeed = 24 // Soft floor to avoid identical times at long distances

  // Apply a soft floor: if below min, lift to a small jittered band above the floor
  if (finalSpeed < minSpeed) {
    finalSpeed = minSpeed + Math.random() * 2 // 24–26 m/s to prevent exact identical times
  }

  return finalSpeed
}

/**
 * Calculate progress increment for a single frame
 * Progress is a percentage (0-100) of race completion
 */
export function calculateProgressIncrement(
  speed: number,
  distance: number,
  deltaTime: number
): number {
  // Speed is in arbitrary units, normalize to distance
  // Higher speed = more progress per frame
  const progressPerSecond = (speed / distance) * 10
  const progressIncrement = (progressPerSecond * deltaTime) / 1000

  return progressIncrement
}

/**
 * Calculate race result points based on position
 */
export function calculatePoints(position: number): number {
  const pointsMap: Record<number, number> = {
    1: 10,
    2: 8,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
    9: 1,
    10: 1,
  }

  return pointsMap[position] || 0
}

/**
 * Apply fatigue to horse after a race
 * Condition decreases slightly after each race
 */
export function applyFatigue(condition: number, fatigueMultiplier: number = 0.95): number {
  const newCondition = Math.floor(condition * fatigueMultiplier)
  return Math.max(1, newCondition) // Ensure minimum condition of 1
}
