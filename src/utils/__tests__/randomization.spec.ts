import { describe, it, expect } from 'vitest'
import { randomInt, randomFloat, shuffle, selectRandom } from '../randomization'

describe('randomization utilities', () => {
  describe('randomInt', () => {
    it('should generate integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('should handle min === max', () => {
      const result = randomInt(5, 5)
      expect(result).toBe(5)
    })
  })

  describe('randomFloat', () => {
    it('should generate float within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(0.5, 1.5)
        expect(result).toBeGreaterThanOrEqual(0.5)
        expect(result).toBeLessThanOrEqual(1.5)
      }
    })
  })

  describe('shuffle', () => {
    it('should return array of same length', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffle(original)
      expect(shuffled.length).toBe(original.length)
    })

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffle(original)
      original.forEach((item) => {
        expect(shuffled).toContain(item)
      })
    })

    it('should not mutate original array', () => {
      const original = [1, 2, 3, 4, 5]
      const copy = [...original]
      shuffle(original)
      expect(original).toEqual(copy)
    })
  })

  describe('selectRandom', () => {
    it('should select correct number of items', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const selected = selectRandom(array, 5)
      expect(selected.length).toBe(5)
    })

    it('should not contain duplicates', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const selected = selectRandom(array, 5)
      const unique = new Set(selected)
      expect(unique.size).toBe(selected.length)
    })

    it('should throw error if count > array length', () => {
      const array = [1, 2, 3]
      expect(() => selectRandom(array, 5)).toThrow()
    })
  })
})
