import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, Store } from 'vuex'
import horsesModule from '../horses'
import racesModule from '../races'
import resultsModule from '../results'
import type { RootState } from '../index'
import type { RaceRound } from '@/types'
import { MIN_HORSES_FOR_RACE } from '@/utils/constants'
import { RaceState } from '@/types'

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
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        const schedule = store.getters['races/schedule']
        expect(schedule.length).toBe(6)
      }
    })

    it('should generate schedule with correct round numbers', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        const schedule: RaceRound[] = store.getters['races/schedule']
        schedule.forEach((round, index) => {
          expect(round.roundNumber).toBe(index + 1)
        })
      }
    })

    it('should generate schedule with correct distances', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
        const schedule: RaceRound[] = store.getters['races/schedule']
        schedule.forEach((round, index) => {
          expect(round.distance).toBe(expectedDistances[index])
        })
      }
    })

    it('should select 10 horses per race', async () => {
      // Keep generating until we have enough horses
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        const schedule: RaceRound[] = store.getters['races/schedule']
        schedule.forEach((round) => {
          expect(round.participants.length).toBe(10)
        })
      }
    })

    it('should set state to SCHEDULE_READY after generation', async () => {
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }

      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
        expect(store.getters['races/raceState']).toBe(RaceState.SCHEDULE_READY)
      }
    })
  })

  describe('state transitions', () => {
    beforeEach(async () => {
      // Generate enough horses for testing
      let attempts = 0
      while (store.getters['horses/horseCount'] < MIN_HORSES_FOR_RACE && attempts < 20) {
        await store.dispatch('horses/generateHorses')
        attempts++
      }
      if (store.getters['horses/horseCount'] >= MIN_HORSES_FOR_RACE) {
        await store.dispatch('races/generateSchedule')
      }
    })

    it('should not allow startRace from IDLE state', async () => {
      store.commit('races/RESET_RACES')
      expect(store.getters['races/raceState']).toBe(RaceState.IDLE)
      await expect(async () => {
        await store.dispatch('races/startRace')
      }).rejects.toThrow(/Cannot start race from state/)
    })

    it('should allow startRace from SCHEDULE_READY state', async () => {
      expect(store.getters['races/raceState']).toBe(RaceState.SCHEDULE_READY)
      await store.dispatch('races/startRace')
      expect(store.getters['races/raceState']).toBe(RaceState.RACE_IN_PROGRESS)
    })

    it('should not allow completeCurrentRound from SCHEDULE_READY state', async () => {
      expect(store.getters['races/raceState']).toBe(RaceState.SCHEDULE_READY)
      await expect(async () => {
        await store.dispatch('races/completeCurrentRound')
      }).rejects.toThrow(/Cannot complete race from state/)
    })

    it('should allow completeCurrentRound from RACE_IN_PROGRESS state', async () => {
      await store.dispatch('races/startRace')
      expect(store.getters['races/raceState']).toBe(RaceState.RACE_IN_PROGRESS)
      await store.dispatch('races/completeCurrentRound')
      expect(store.getters['races/raceState']).toBe(RaceState.RACE_COMPLETED)
    })

    it('should not allow nextRound from SCHEDULE_READY state', async () => {
      expect(store.getters['races/raceState']).toBe(RaceState.SCHEDULE_READY)
      await expect(async () => {
        await store.dispatch('races/nextRound')
      }).rejects.toThrow(/Cannot move to next round from state/)
    })

    it('should allow nextRound from RACE_COMPLETED state', async () => {
      await store.dispatch('races/startRace')
      await store.dispatch('races/completeCurrentRound')
      expect(store.getters['races/raceState']).toBe(RaceState.RACE_COMPLETED)
      await store.dispatch('races/nextRound')
      expect(store.getters['races/raceState']).toBe(RaceState.SCHEDULE_READY)
      expect(store.getters['races/currentRoundIndex']).toBe(1)
    })

    it('should transition to ALL_RACES_COMPLETED after final round', async () => {
      // Complete all 6 rounds
      for (let i = 0; i < 6; i++) {
        await store.dispatch('races/startRace')
        await store.dispatch('races/completeCurrentRound')
        if (i < 5) {
          await store.dispatch('races/nextRound')
        }
      }
      expect(store.getters['races/raceState']).toBe(RaceState.ALL_RACES_COMPLETED)
      expect(store.getters['races/allRacesCompleted']).toBe(true)
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
