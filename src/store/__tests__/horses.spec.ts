import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, Store } from 'vuex'
import horsesModule from '../horses'
import racesModule from '../races'
import resultsModule from '../results'
import type { RootState } from '../index'
import { MAX_HORSES } from '@/utils/constants'

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
    it('should generate exactly 20 horses', async () => {
      await store.dispatch('horses/generateHorses')
      expect(store.state.horses.horses.length).toBe(MAX_HORSES)
    })

    it('should generate horses with unique IDs', async () => {
      await store.dispatch('horses/generateHorses')
      const ids = store.state.horses.horses.map((h) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(MAX_HORSES)
    })

    it('should generate horses with unique names', async () => {
      await store.dispatch('horses/generateHorses')
      const names = store.state.horses.horses.map((h) => h.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(MAX_HORSES)
    })

    it('should generate horses with unique colors', async () => {
      await store.dispatch('horses/generateHorses')
      const colors = store.state.horses.horses.map((h) => h.color)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(MAX_HORSES)
    })

    it('should generate horses with condition between 1-100', async () => {
      await store.dispatch('horses/generateHorses')
      store.state.horses.horses.forEach((horse) => {
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('selectRandomHorses', () => {
    it('should select correct number of horses', async () => {
      await store.dispatch('horses/generateHorses')
      const selected = (await store.dispatch('horses/selectRandomHorses', 10)) as any[]
      expect(selected.length).toBe(10)
    })

    it('should not select duplicate horses', async () => {
      await store.dispatch('horses/generateHorses')
      const selected = (await store.dispatch('horses/selectRandomHorses', 10)) as any[]
      const ids = selected.map((h) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(10)
    })

    it('should throw error if count exceeds available horses', async () => {
      await store.dispatch('horses/generateHorses')
      await expect(async () => {
        await store.dispatch('horses/selectRandomHorses', 25)
      }).rejects.toThrow()
    })
  })

  describe('getters', () => {
    it('getHorseById should find horse', async () => {
      await store.dispatch('horses/generateHorses')
      const firstHorse = store.state.horses.horses[0]
      const found = (store.getters['horses/getHorseById'] as (id: string) => any)(firstHorse.id)
      expect(found).toEqual(firstHorse)
    })

    it('hasHorses should return true after generation', async () => {
      expect(store.getters['horses/hasHorses']).toBe(false)
      await store.dispatch('horses/generateHorses')
      expect(store.getters['horses/hasHorses']).toBe(true)
    })
  })

  describe('updateHorseCondition', () => {
    it('should update horse condition', async () => {
      await store.dispatch('horses/generateHorses')
      const horseId = store.state.horses.horses[0].id
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: 50 })
      expect(store.state.horses.horses[0].condition).toBe(50)
    })

    it('should clamp condition to 1-100', async () => {
      await store.dispatch('horses/generateHorses')
      const horseId = store.state.horses.horses[0].id
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: 150 })
      expect(store.state.horses.horses[0].condition).toBe(100)
      await store.dispatch('horses/updateHorseCondition', { id: horseId, condition: -10 })
      expect(store.state.horses.horses[0].condition).toBe(1)
    })
  })

  describe('applyFatigueToHorses', () => {
    it('should reduce condition of specified horses', async () => {
      await store.dispatch('horses/generateHorses')
      const originalCondition = store.state.horses.horses[0].condition
      await store.dispatch('horses/applyFatigueToHorses', [store.state.horses.horses[0].id])
      expect(store.state.horses.horses[0].condition).toBeLessThan(originalCondition)
    })
  })
})

