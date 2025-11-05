import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, Store } from 'vuex'
import horsesModule from '../horses'
import racesModule from '../races'
import resultsModule from '../results'
import type { RootState } from '../index'
import { MIN_HORSES, MAX_HORSES, MIN_HORSES_FOR_RACE } from '@/utils/constants'

describe('Horses Store', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore<RootState>({
      modules: {
        horses: horsesModule,
        races: racesModule,
        results: resultsModule,
      },
    })
  })

  describe('generateHorses', () => {
    it('should generate between 1 and 20 horses', async () => {
      await store.dispatch('horses/generateHorses')
      const horseCount = store.getters['horses/horseCount']
      expect(horseCount).toBeGreaterThanOrEqual(MIN_HORSES)
      expect(horseCount).toBeLessThanOrEqual(MAX_HORSES)
    })

    it('should generate horses with unique IDs', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const ids = horses.map((h: any) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(horses.length)
    })

    it('should generate horses with unique names', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const names = horses.map((h: any) => h.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(horses.length)
    })

    it('should generate horses with unique colors', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const colors = horses.map((h: any) => h.color)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(horses.length)
    })

    it('should generate horses with condition between 1-100', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      horses.forEach((horse: any) => {
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('selectRandomHorses', () => {
    it('should select correct number of horses', async () => {
      // Keep generating until we have at least 10 horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < 10 && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }
      
      expect(store.getters['horses/horseCount']).toBeGreaterThanOrEqual(10)
      const selected = (await store.dispatch('horses/selectRandomHorses', 10)) as any[]
      expect(selected.length).toBe(10)
    })

    it('should not select duplicate horses', async () => {
      // Keep generating until we have at least 10 horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < 10 && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }
      
      expect(store.getters['horses/horseCount']).toBeGreaterThanOrEqual(10)
      const selected = (await store.dispatch('horses/selectRandomHorses', 10)) as any[]
      const ids = selected.map((h) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })

    it('should throw error if count exceeds available horses', async () => {
      await store.dispatch('horses/generateHorses')
      const horseCount = store.getters['horses/horseCount']
      await expect(async () => {
        await store.dispatch('horses/selectRandomHorses', horseCount + 5)
      }).rejects.toThrow()
    })
  })

  describe('getters', () => {
    it('getHorseById should find horse', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const firstHorse = horses[0]
      const found = (store.getters['horses/getHorseById'] as (id: string) => any)(firstHorse.id)
      expect(found).toEqual(firstHorse)
    })

    it('hasHorses should return true after generation', async () => {
      expect(store.getters['horses/hasHorses']).toBe(false)
      await store.dispatch('horses/generateHorses')
      expect(store.getters['horses/hasHorses']).toBe(true)
    })

    it('hasEnoughHorsesForRace should return true when >= 10 horses', async () => {
      // Keep generating until we have at least 10 horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }
      
      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        expect(store.getters['horses/hasEnoughHorsesForRace']).toBe(true)
      }
    })

    it('horseCount should return correct count', async () => {
      expect(store.getters['horses/horseCount']).toBe(0)
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      expect(store.getters['horses/horseCount']).toBe(horses.length)
    })
  })

  describe('updateHorseCondition', () => {
    it('should update horse condition', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const horseId = horses[0].id
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: 50 })
      const updatedHorse = store.getters['horses/getHorseById'](horseId)
      expect(updatedHorse.condition).toBe(50)
    })

    it('should clamp condition to 1-100', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const horseId = horses[0].id
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: 150 })
      let updatedHorse = store.getters['horses/getHorseById'](horseId)
      expect(updatedHorse.condition).toBe(100)
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: -10 })
      updatedHorse = store.getters['horses/getHorseById'](horseId)
      expect(updatedHorse.condition).toBe(1)
    })
  })

  describe('applyFatigueToHorses', () => {
    it('should reduce condition of specified horses', async () => {
      await store.dispatch('horses/generateHorses')
      const horses = store.getters['horses/horses']
      const horseId = horses[0].id
      const originalCondition = horses[0].condition
      await store.dispatch('horses/applyFatigueToHorses', [horseId])
      const updatedHorse = store.getters['horses/getHorseById'](horseId)
      expect(updatedHorse.condition).toBeLessThan(originalCondition)
    })
  })
})

