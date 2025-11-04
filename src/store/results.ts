/**
 * Results Module
 * Stores and manages race results and overall standings
 */

import type { Module } from 'vuex'
import type { RaceResult, HorseStanding } from '@/types'
import type { RootState } from './index'

export interface ResultsState {
  roundResults: RaceResult[]
  overallStandings: HorseStanding[]
}

const resultsModule: Module<ResultsState, RootState> = {
  namespaced: true,

  state: (): ResultsState => ({
    roundResults: [],
    overallStandings: [],
  }),

  getters: {
    /**
     * Get results for a specific round
     */
    getResultsByRound: (state) => (roundNumber: number): RaceResult[] => {
      return state.roundResults.filter((result) => result.roundNumber === roundNumber)
    },

    /**
     * Get all results for a specific horse
     */
    getHorsePerformanceHistory: (state) => (horseId: string): RaceResult[] => {
      return state.roundResults.filter((result) => result.horseId === horseId)
    },

    /**
     * Get the champion horse (highest total points)
     */
    championHorse: (state): HorseStanding | null => {
      if (state.overallStandings.length === 0) return null

      return state.overallStandings.reduce((champion, current) =>
        current.totalPoints > champion.totalPoints ? current : champion
      )
    },

    /**
     * Get standings sorted by total points
     */
    sortedStandings: (state): HorseStanding[] => {
      return [...state.overallStandings].sort((a, b) => b.totalPoints - a.totalPoints)
    },

    /**
     * Check if results exist
     */
    hasResults: (state): boolean => {
      return state.roundResults.length > 0
    },
  },

  mutations: {
    ADD_ROUND_RESULT(state, result: RaceResult) {
      state.roundResults.push(result)
    },

    ADD_ROUND_RESULTS(state, results: RaceResult[]) {
      state.roundResults.push(...results)
    },

    SET_OVERALL_STANDINGS(state, standings: HorseStanding[]) {
      state.overallStandings = standings
    },

    CLEAR_RESULTS(state) {
      state.roundResults = []
      state.overallStandings = []
    },
  },

  actions: {
    /**
     * Record results for a completed round
     */
    recordRoundResult({ commit, dispatch }, result: RaceResult) {
      commit('ADD_ROUND_RESULT', result)
      dispatch('calculateStandings')
    },

    /**
     * Record multiple results (entire round)
     */
    recordRoundResults({ commit, dispatch }, results: RaceResult[]) {
      commit('ADD_ROUND_RESULTS', results)
      dispatch('calculateStandings')
    },

    /**
     * Calculate overall standings from all race results
     */
    calculateStandings({ state, commit, rootGetters }) {
      const standingsMap = new Map<string, HorseStanding>()

      // Aggregate data from all results
      state.roundResults.forEach((result: RaceResult) => {
        const horse = rootGetters['horses/getHorseById'](result.horseId)
        if (!horse) return

        if (!standingsMap.has(result.horseId)) {
          standingsMap.set(result.horseId, {
            horseId: result.horseId,
            horseName: horse.name,
            horseColor: horse.color,
            totalPoints: 0,
            racesParticipated: 0,
            averagePosition: 0,
            bestPosition: Infinity,
            positions: [],
          })
        }

        const standing = standingsMap.get(result.horseId)!
        standing.totalPoints += result.points
        standing.racesParticipated++
        standing.positions.push(result.position)
        standing.bestPosition = Math.min(standing.bestPosition, result.position)
      })

      // Calculate average positions
      standingsMap.forEach((standing: HorseStanding) => {
        const sum = standing.positions.reduce((acc: number, pos: number) => acc + pos, 0)
        standing.averagePosition = sum / standing.positions.length
      })

      commit('SET_OVERALL_STANDINGS', Array.from(standingsMap.values()))
    },

    /**
     * Clear all results
     */
    clearResults({ commit }) {
      commit('CLEAR_RESULTS')
    },

    /**
     * Export results as JSON
     */
    exportResults({ state, getters }): string {
      return JSON.stringify(
        {
          roundResults: state.roundResults,
          overallStandings: getters.sortedStandings,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      )
    },
  },
}

export default resultsModule
