import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, Store } from 'vuex'
import horsesModule from '../horses'
import racesModule from '../races'
import resultsModule from '../results'
import type { RootState } from '../index'
import { MIN_HORSES_FOR_RACE } from '@/utils/constants'

describe('Races Store', () => {
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

  describe('generateSchedule', () => {
    it('should throw error if insufficient horses', async () => {
      // Manually set a small number of horses (less than 10)
      const insufficientHorses = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        name: `Horse ${i}`,
        color: `#${i}${i}${i}${i}${i}${i}`,
        condition: 50,
      }))
      
      store.commit('horses/SET_HORSES', insufficientHorses)
      
      await expect(async () => {
        await store.dispatch('races/generateSchedule')
      }).rejects.toThrow(/Insufficient horses/)
    })

    it('should generate schedule when enough horses are available', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.state.horses.horses.length < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.state.horses.horses.length >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        expect(store.state.races.schedule.length).toBe(6)
      }
    })

    it('should generate schedule with correct round numbers', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.state.horses.horses.length < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.state.horses.horses.length >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        store.state.races.schedule.forEach((round, index) => {
          expect(round.roundNumber).toBe(index + 1)
        })
      }
    })

    it('should generate schedule with correct distances', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.state.horses.horses.length < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.state.horses.horses.length >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
        store.state.races.schedule.forEach((round, index) => {
          expect(round.distance).toBe(expectedDistances[index])
        })
      }
    })

    it('should select 10 horses per race', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.state.horses.horses.length < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.state.horses.horses.length >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        store.state.races.schedule.forEach((round) => {
          expect(round.participants.length).toBe(10)
        })
      }
    })
  })

  describe('getters', () => {
    it('isRaceInProgress should return false initially', () => {
      expect(store.getters['races/isRaceInProgress']).toBe(false)
    })

    it('allRacesCompleted should return false initially', () => {
      expect(store.getters['races/allRacesCompleted']).toBe(false)
    })

    it('currentRound should return null when no schedule', () => {
      expect(store.getters['races/currentRound']).toBeNull()
    })
  })
})
