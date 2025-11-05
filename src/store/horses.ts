/**
 * Horses Module
 * Manages the pool of 20 horses, their properties, and selection logic
 */

import type { Module } from 'vuex'
import type { Horse } from '@/types'
import type { RootState } from './index'
import {
  MIN_HORSES,
  MAX_HORSES,
  MIN_HORSES_FOR_RACE,
  HORSE_NAMES,
  HORSE_COLORS,
  MIN_CONDITION,
  MAX_CONDITION,
  FATIGUE_FACTOR,
  REST_RECOVERY_MIN,
  REST_RECOVERY_MAX,
} from '@/utils/constants'
import { randomInt, selectRandom } from '@/utils/randomization'
import { applyFatigue } from '@/utils/race-engine'

export interface HorsesState {
  byId: Record<string, Horse>
  allIds: string[]
  selectedHorseIds: string[]
}

const horsesModule: Module<HorsesState, RootState> = {
  namespaced: true,

  state: (): HorsesState => ({
    byId: {},
    allIds: [],
    selectedHorseIds: [],
  }),

  getters: {
    /**
     * Get horse by ID - O(1) lookup
     */
    getHorseById: (state) => (id: string): Horse | undefined => {
      return state.byId[id]
    },

    /**
     * Get multiple horses by IDs - O(n) where n is ids.length
     */
    getHorsesByIds: (state) => (ids: string[]): Horse[] => {
      return ids.map(id => state.byId[id]).filter(Boolean) as Horse[]
    },

    /**
     * Get horses not in current selection
     */
    availableHorses: (state): Horse[] => {
      const selectedSet = new Set(state.selectedHorseIds)
      return state.allIds
        .filter(id => !selectedSet.has(id))
        .map(id => state.byId[id])
    },

    /**
     * Check if horses have been generated
     */
    hasHorses: (state): boolean => {
      return state.allIds.length >= MIN_HORSES && state.allIds.length <= MAX_HORSES
    },

    /**
     * Check if there are enough horses to start a race
     */
    hasEnoughHorsesForRace: (state): boolean => {
      return state.allIds.length >= MIN_HORSES_FOR_RACE
    },

    /**
     * Get the count of generated horses
     */
    horseCount: (state): number => {
      return state.allIds.length
    },

    /**
     * Get all horses as array
     */
    horses: (state): Horse[] => state.allIds.map(id => state.byId[id]),

    /**
     * Get selected horses
     */
    selectedHorses: (state): Horse[] => state.selectedHorseIds.map(id => state.byId[id]),
  },

  mutations: {
    SET_HORSES(state, horses: Horse[]) {
      // Normalize horses into byId map and allIds array
      state.byId = {}
      state.allIds = []
      horses.forEach(horse => {
        state.byId[horse.id] = horse
        state.allIds.push(horse.id)
      })
    },

    SET_SELECTED_HORSES(state, horses: Horse[]) {
      state.selectedHorseIds = horses.map(h => h.id)
    },

    UPDATE_HORSE_CONDITION(state, { id, condition }: { id: string; condition: number }) {
      const horse = state.byId[id]
      if (horse) {
        horse.condition = Math.max(MIN_CONDITION, Math.min(MAX_CONDITION, condition))
      }
    },

    CLEAR_HORSES(state) {
      state.byId = {}
      state.allIds = []
      state.selectedHorseIds = []
    },
  },

  actions: {
    /**
     * Generate random number of horses (1-20) with random conditions
     */
    generateHorses({ commit }) {
      // Generate random count between MIN_HORSES and MAX_HORSES
      const horseCount = Math.floor(Math.random() * (MAX_HORSES - MIN_HORSES + 1)) + MIN_HORSES
      
      // Shuffle the horse names and colors to get random selection
      const shuffledIndices = Array.from({ length: HORSE_NAMES.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, horseCount)
      
      const horses: Horse[] = shuffledIndices.map((index, newIndex) => ({
        id: String(newIndex), // Simple incrementing IDs: "0", "1", "2", etc.
        name: HORSE_NAMES[index],
        color: HORSE_COLORS[index],
        condition: Math.floor(Math.random() * 100) + 1, // 1-100
      }))

      commit('SET_HORSES', horses)
      commit('SET_SELECTED_HORSES', [])
    },

    /**
     * Update a horse's condition
     */
    updateHorseCondition({ commit }, { id, condition }: { id: string; condition: number }) {
      commit('UPDATE_HORSE_CONDITION', { id, condition })
    },

    /**
     * Select N random horses from the pool
     */
    selectRandomHorses({ state, commit, getters }, count: number): Horse[] {
      if (count > state.allIds.length) {
        throw new Error(`Cannot select ${count} horses from pool of ${state.allIds.length}`)
      }

      const allHorses: Horse[] = getters.horses
      const selectedHorses = selectRandom(allHorses, count) as Horse[]
      commit('SET_SELECTED_HORSES', selectedHorses)
      return selectedHorses
    },

    /**
     * Apply fatigue to horses after a race
     */
    applyFatigueToHorses({ commit, state }, horseIds: string[]) {
      horseIds.forEach((id) => {
        const horse = state.byId[id]
        if (horse) {
          const newCondition = applyFatigue(horse.condition, FATIGUE_FACTOR)
          commit('UPDATE_HORSE_CONDITION', { id, condition: newCondition })
        }
      })
    },

    /**
     * Apply rest recovery to horses that did not run in the round
     */
    applyRestRecoveryToHorses({ commit, state }, horseIds: string[]) {
      horseIds.forEach((id) => {
        const horse = state.byId[id]
        if (horse) {
          const recovery = randomInt(REST_RECOVERY_MIN, REST_RECOVERY_MAX)
          const newCondition = Math.min(MAX_CONDITION, horse.condition + recovery)
          commit('UPDATE_HORSE_CONDITION', { id, condition: newCondition })
        }
      })
    },

    /**
     * Reset all horses to random conditions
     */
    resetHorses({ commit, getters }) {
      const updatedHorses = getters.horses.map((horse: Horse) => ({
        ...horse,
        condition: randomInt(MIN_CONDITION, MAX_CONDITION),
      }))
      commit('SET_HORSES', updatedHorses)
      commit('SET_SELECTED_HORSES', [])
    },

    /**
     * Clear all horses
     */
    clearHorses({ commit }) {
      commit('CLEAR_HORSES')
    },
  },
}

export default horsesModule
