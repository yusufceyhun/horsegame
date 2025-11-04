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
  horses: Horse[]
  selectedHorses: Horse[]
}

const horsesModule: Module<HorsesState, RootState> = {
  namespaced: true,

  state: (): HorsesState => ({
    horses: [],
    selectedHorses: [],
  }),

  getters: {
    /**
     * Get horse by ID
     */
    getHorseById: (state) => (id: string): Horse | undefined => {
      return state.horses.find((horse) => horse.id === id)
    },

    /**
     * Get multiple horses by IDs
     */
    getHorsesByIds: (state) => (ids: string[]): Horse[] => {
      return state.horses.filter((horse) => ids.includes(horse.id))
    },

    /**
     * Get horses not in current selection
     */
    availableHorses: (state): Horse[] => {
      const selectedIds = new Set(state.selectedHorses.map((h: Horse) => h.id))
      return state.horses.filter((horse) => !selectedIds.has(horse.id))
    },

    /**
     * Check if horses have been generated
     */
    hasHorses: (state): boolean => {
      return state.horses.length >= MIN_HORSES && state.horses.length <= MAX_HORSES
    },

    /**
     * Check if there are enough horses to start a race
     */
    hasEnoughHorsesForRace: (state): boolean => {
      return state.horses.length >= MIN_HORSES_FOR_RACE
    },

    /**
     * Get the count of generated horses
     */
    horseCount: (state): number => {
      return state.horses.length
    },

    /**
     * Get all horses
     */
    horses: (state): Horse[] => state.horses,
  },

  mutations: {
    SET_HORSES(state, horses: Horse[]) {
      state.horses = horses
    },

    SET_SELECTED_HORSES(state, horses: Horse[]) {
      state.selectedHorses = horses
    },

    UPDATE_HORSE_CONDITION(state, { id, condition }: { id: string; condition: number }) {
      const horse = state.horses.find((h) => h.id === id)
      if (horse) {
        horse.condition = Math.max(MIN_CONDITION, Math.min(MAX_CONDITION, condition))
      }
    },

    CLEAR_HORSES(state) {
      state.horses = []
      state.selectedHorses = []
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
    selectRandomHorses({ state, commit }, count: number): Horse[] {
      if (count > state.horses.length) {
        throw new Error(`Cannot select ${count} horses from pool of ${state.horses.length}`)
      }

      const selectedHorses = selectRandom(state.horses, count)
      commit('SET_SELECTED_HORSES', selectedHorses)
      return selectedHorses
    },

    /**
     * Apply fatigue to horses after a race
     */
    applyFatigueToHorses({ commit, state }, horseIds: string[]) {
      horseIds.forEach((id) => {
        const horse = state.horses.find((h) => h.id === id)
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
        const horse = state.horses.find((h) => h.id === id)
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
    resetHorses({ state, commit }) {
      const updatedHorses = state.horses.map((horse) => ({
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
