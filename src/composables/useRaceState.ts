/**
 * Typed composable for accessing race state
 * Provides type-safe access to race progress and state without 'as any' casts
 */

import { computed, type ComputedRef } from 'vue'
import { useStore } from '@/store'
import type { RaceRound, RaceProgress } from '@/types'
import { RaceState } from '@/types'

export interface UseRaceStateReturn {
  currentRound: ComputedRef<RaceRound | null>
  isRaceInProgress: ComputedRef<boolean>
  raceState: ComputedRef<RaceState>
  allRaceProgress: ComputedRef<RaceProgress[]>
  getRaceProgress: (horseId: string) => RaceProgress | undefined
  schedule: ComputedRef<RaceRound[]>
  completedRounds: ComputedRef<RaceRound[]>
  remainingRounds: ComputedRef<RaceRound[]>
  allRacesCompleted: ComputedRef<boolean>
}

/**
 * Composable for type-safe access to race state
 * Eliminates need for 'as any' casts when accessing store
 */
export function useRaceState(): UseRaceStateReturn {
  const store = useStore()

  const currentRound = computed<RaceRound | null>(() => 
    store.getters['races/currentRound']
  )

  const isRaceInProgress = computed<boolean>(() => 
    store.getters['races/isRaceInProgress']
  )

  const raceState = computed<RaceState>(() => 
    store.getters['races/raceState']
  )

  const schedule = computed<RaceRound[]>(() => 
    store.getters['races/schedule']
  )

  const completedRounds = computed<RaceRound[]>(() => 
    store.getters['races/completedRounds']
  )

  const remainingRounds = computed<RaceRound[]>(() => 
    store.getters['races/remainingRounds']
  )

  const allRacesCompleted = computed<boolean>(() => 
    store.getters['races/allRacesCompleted']
  )

  // Get all race progress as an array
  const allRaceProgress = computed<RaceProgress[]>(() => 
    Object.values(store.state.races.raceProgress)
  )

  // Get progress for a specific horse
  const getRaceProgress = (horseId: string): RaceProgress | undefined => {
    return store.state.races.raceProgress[horseId]
  }

  return {
    currentRound,
    isRaceInProgress,
    raceState,
    allRaceProgress,
    getRaceProgress,
    schedule,
    completedRounds,
    remainingRounds,
    allRacesCompleted,
  }
}
