/**
 * Races Module
 * Manages race schedule, current race state, and race execution
 */

import type { Module } from 'vuex'
import type { RaceRound, RaceProgress } from '@/types'
import { RaceState, RoundStatus } from '@/types'
import type { RootState } from './index'
import { TOTAL_ROUNDS, ROUND_DISTANCES, HORSES_PER_RACE, MIN_HORSES_FOR_RACE } from '@/utils/constants'

export interface RacesState {
  schedule: RaceRound[]
  currentRoundIndex: number
  raceState: RaceState
  raceProgress: Map<string, RaceProgress>
}

const racesModule: Module<RacesState, RootState> = {
  namespaced: true,

  state: (): RacesState => ({
    schedule: [],
    currentRoundIndex: 0,
    raceState: RaceState.IDLE,
    raceProgress: new Map(),
  }),

  getters: {
    /**
     * Get current round
     */
    currentRound: (state): RaceRound | null => {
      return state.schedule[state.currentRoundIndex] || null
    },

    /**
     * Check if race is in progress
     */
    isRaceInProgress: (state): boolean => {
      return state.raceState === RaceState.RACE_IN_PROGRESS
    },

    /**
     * Get completed rounds
     */
    completedRounds: (state): RaceRound[] => {
      return state.schedule.filter((round: RaceRound) => round.status === RoundStatus.COMPLETED)
    },

    /**
     * Get remaining rounds
     */
    remainingRounds: (state): RaceRound[] => {
      return state.schedule.filter(
        (round: RaceRound) => round.status === RoundStatus.PENDING || round.status === RoundStatus.IN_PROGRESS
      )
    },

    /**
     * Check if all races completed
     */
    allRacesCompleted: (state): boolean => {
      return (
        state.schedule.length > 0 &&
        state.schedule.every((round: RaceRound) => round.status === RoundStatus.COMPLETED)
      )
    },

    /**
     * Check if schedule is ready
     */
    isScheduleReady: (state): boolean => {
      return state.schedule.length === TOTAL_ROUNDS && state.raceState !== RaceState.IDLE
    },

    schedule: (state): RaceRound[] => state.schedule,
    currentRoundIndex: (state): number => state.currentRoundIndex,
    raceState: (state): RaceState => state.raceState,
  },

  mutations: {
    SET_SCHEDULE(state, schedule: RaceRound[]) {
      state.schedule = schedule
    },

    SET_CURRENT_ROUND_INDEX(state, index: number) {
      state.currentRoundIndex = index
    },

    SET_RACE_STATE(state, raceState: RaceState) {
      state.raceState = raceState
    },

    UPDATE_ROUND_STATUS(state, { index, status }: { index: number; status: RoundStatus }) {
      if (state.schedule[index]) {
        state.schedule[index].status = status
      }
    },

    SET_ROUND_START_TIME(state, { index, time }: { index: number; time: number }) {
      if (state.schedule[index]) {
        state.schedule[index].startTime = time
      }
    },

    SET_ROUND_END_TIME(state, { index, time }: { index: number; time: number }) {
      if (state.schedule[index]) {
        state.schedule[index].endTime = time
      }
    },

    SET_ROUND_RESULTS(state, { index, results }: { index: number; results: any[] }) {
      if (state.schedule[index]) {
        state.schedule[index].results = results
      }
    },

    SET_RACE_PROGRESS(state, { horseId, progress }: { horseId: string; progress: RaceProgress }) {
      state.raceProgress.set(horseId, progress)
    },

    CLEAR_RACE_PROGRESS(state) {
      state.raceProgress.clear()
    },

    RESET_RACES(state) {
      state.schedule = []
      state.currentRoundIndex = 0
      state.raceState = RaceState.IDLE
      state.raceProgress.clear()
    },
  },

  actions: {
    /**
     * Generate race schedule with 6 rounds
     */
    async generateSchedule({ commit, dispatch, rootGetters }) {
      // Ensure horses are generated
      if (!rootGetters['horses/hasHorses']) {
        await dispatch('horses/generateHorses', null, { root: true })
      }

      // Validate minimum horse count
      const horseCount = rootGetters['horses/horseCount']
      if (horseCount < MIN_HORSES_FOR_RACE) {
        throw new Error(
          `Insufficient horses to start a race. Generated ${horseCount} horses, but at least ${MIN_HORSES_FOR_RACE} are required. Please generate horses again.`
        )
      }

      const schedule = []
      for (let index = 0; index < TOTAL_ROUNDS; index++) {
        const roundNumber = index + 1
        const distance = ROUND_DISTANCES[index]

        // Select random horses for this round
        const participants = await dispatch('horses/selectRandomHorses', HORSES_PER_RACE, { root: true })

        schedule.push({
          roundNumber,
          distance,
          participants: [...participants],
          status: RoundStatus.PENDING,
          results: [],
        })
      }

      commit('SET_SCHEDULE', schedule)
      commit('SET_CURRENT_ROUND_INDEX', 0)
      commit('SET_RACE_STATE', RaceState.SCHEDULE_READY)
      commit('CLEAR_RACE_PROGRESS')
    },

    clearRaceProgress({ commit }) {
      commit('CLEAR_RACE_PROGRESS')
    },

    /**
     * Start the current race
     */
    startRace({ state, commit, getters }) {
      const currentRound = getters.currentRound
      if (!currentRound) {
        throw new Error('No current round available')
      }

      commit('UPDATE_ROUND_STATUS', { index: state.currentRoundIndex, status: RoundStatus.IN_PROGRESS })
      commit('SET_ROUND_START_TIME', { index: state.currentRoundIndex, time: Date.now() })
      commit('SET_RACE_STATE', RaceState.RACE_IN_PROGRESS)

      // Initialize progress tracking for each horse
      commit('CLEAR_RACE_PROGRESS')
      currentRound.participants.forEach((horse: any) => {
        commit('SET_RACE_PROGRESS', {
          horseId: horse.id,
          progress: {
            horseId: horse.id,
            progress: 0,
            speed: 0,
            finished: false,
          },
        })
      })
    },

    /**
     * Update race progress for a horse
     */
    updateRaceProgress({ commit }, { horseId, progress }: { horseId: string; progress: RaceProgress }) {
      commit('SET_RACE_PROGRESS', { horseId, progress })
    },

    /**
     * Complete the current round
     */
    completeCurrentRound({ state, commit, getters }) {
      const currentRound = getters.currentRound
      if (!currentRound) {
        throw new Error('No current round to complete')
      }

      commit('UPDATE_ROUND_STATUS', { index: state.currentRoundIndex, status: RoundStatus.COMPLETED })
      commit('SET_ROUND_END_TIME', { index: state.currentRoundIndex, time: Date.now() })
      commit('SET_RACE_STATE', RaceState.RACE_COMPLETED)

      // Check if all races completed
      if (getters.allRacesCompleted) {
        commit('SET_RACE_STATE', RaceState.ALL_RACES_COMPLETED)
      }
    },

    /**
     * Move to next round
     */
    nextRound({ state, commit }) {
      if (state.currentRoundIndex < state.schedule.length - 1) {
        commit('SET_CURRENT_ROUND_INDEX', state.currentRoundIndex + 1)
        commit('SET_RACE_STATE', RaceState.SCHEDULE_READY)
        commit('CLEAR_RACE_PROGRESS')
      }
    },

    /**
     * Reset the game
     */
    resetGame({ commit }) {
      commit('RESET_RACES')
    },

    /**
     * Get progress for a specific horse
     */
    getHorseProgress({ state }, horseId: string): RaceProgress | undefined {
      return state.raceProgress.get(horseId)
    },

    /**
     * Get all race progress as array
     */
    getAllProgress({ state }): RaceProgress[] {
      return Array.from(state.raceProgress.values())
    },
  },
}

export default racesModule
