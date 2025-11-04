import { describe, it, expect } from 'vitest'
import {
  calculateDistanceSuitability,
  calculateHorseSpeed,
  calculateProgressIncrement,
  calculatePoints,
  applyFatigue,
} from '../race-engine'
import type { Horse } from '@/types'

describe('race-engine', () => {
  const mockHorse: Horse = {
    id: 'test-123',
    name: 'Test Horse',
    color: '#FF0000',
    condition: 80,
  }

  describe('calculateDistanceSuitability', () => {
    it('should return a number between 0.7 and 1', () => {
      const result = calculateDistanceSuitability(mockHorse, 1600)
      expect(result).toBeGreaterThanOrEqual(0.7)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should be consistent for same horse and distance', () => {
      const result1 = calculateDistanceSuitability(mockHorse, 1600)
      const result2 = calculateDistanceSuitability(mockHorse, 1600)
      expect(result1).toBe(result2)
    })
  })

  describe('calculateHorseSpeed', () => {
    it('should return positive speed', () => {
      const speed = calculateHorseSpeed(mockHorse, 1600)
      expect(speed).toBeGreaterThan(0)
    })

    it('should return higher speed for better condition', () => {
      const goodHorse: Horse = { ...mockHorse, condition: 90 }
      const badHorse: Horse = { ...mockHorse, condition: 30 }

      const speeds = []
      for (let i = 0; i < 10; i++) {
        speeds.push({
          good: calculateHorseSpeed(goodHorse, 1600),
          bad: calculateHorseSpeed(badHorse, 1600),
        })
      }

      const avgGood = speeds.reduce((sum, s) => sum + s.good, 0) / speeds.length
      const avgBad = speeds.reduce((sum, s) => sum + s.bad, 0) / speeds.length

      expect(avgGood).toBeGreaterThan(avgBad)
    })

    it('should handle minimum condition', () => {
      const poorHorse: Horse = { ...mockHorse, condition: 1 }
      const speed = calculateHorseSpeed(poorHorse, 1600)
      expect(speed).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateProgressIncrement', () => {
    it('should return positive increment', () => {
      const increment = calculateProgressIncrement(50, 1600, 16.67)
      expect(increment).toBeGreaterThan(0)
    })

    it('should return larger increment for higher speed', () => {
      const slow = calculateProgressIncrement(30, 1600, 16.67)
      const fast = calculateProgressIncrement(80, 1600, 16.67)
      expect(fast).toBeGreaterThan(slow)
    })
  })

  describe('calculatePoints', () => {
    it('should award 10 points for 1st place', () => {
      expect(calculatePoints(1)).toBe(10)
    })

    it('should award 8 points for 2nd place', () => {
      expect(calculatePoints(2)).toBe(8)
    })

    it('should award 6 points for 3rd place', () => {
      expect(calculatePoints(3)).toBe(6)
    })

    it('should award 1 point for 10th place', () => {
      expect(calculatePoints(10)).toBe(1)
    })

    it('should award 0 points for invalid position', () => {
      expect(calculatePoints(11)).toBe(0)
      expect(calculatePoints(0)).toBe(0)
    })
  })

  describe('applyFatigue', () => {
    it('should reduce condition', () => {
      const original = 80
      const fatigued = applyFatigue(original, 0.95)
      expect(fatigued).toBeLessThan(original)
    })

    it('should not go below 1', () => {
      const fatigued = applyFatigue(2, 0.95)
      expect(fatigued).toBeGreaterThanOrEqual(1)
    })

    it('should floor the result', () => {
      const fatigued = applyFatigue(80, 0.95)
      expect(Number.isInteger(fatigued)).toBe(true)
    })
  })
})
