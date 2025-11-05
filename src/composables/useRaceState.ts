/**
 * Typed composable for accessing race state
 * Provides type-safe access to race progress and state without 'as any' casts
 */

import { computed, type ComputedRef } from 'vue'
import { useStore } from '@/store'
import type { RaceRound, RaceProgress, Horse } from '@/types'
import { RaceState } from '@/types'
import { calculatePoints } from '@/utils/race-engine'

export interface HorseFinishData {
  finished: boolean
  time: string
  points: number
}

export interface UseRaceStateReturn {
  currentRound: ComputedRef<RaceRound | null>
  isRaceInProgress: ComputedRef<boolean>
  raceState: ComputedRef<RaceState>
  allRaceProgress: ComputedRef<RaceProgress[]>
  getRaceProgress: (horseId: string) => RaceProgress | undefined
  getHorseProgress: (horseId: string) => number
  getHorseFinishData: (horseId: string) => HorseFinishData
  getSortedHorses: ComputedRef<Horse[]>
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

  /**
   * Get progress percentage for a specific horse (0-100)
   */
  const getHorseProgress = (horseId: string): number => {
    const progress = store.state.races.raceProgress[horseId]
    return progress?.progress ?? 0
  }

  /**
   * Get finish data for a horse (time, points, finished status)
   */
  const getHorseFinishData = (horseId: string): HorseFinishData => {
    const progress = store.state.races.raceProgress[horseId]
    
    if (!progress || !progress.finished) {
      return { finished: false, time: '0.00', points: 0 }
    }
    
    // Prefer viewerFinishTime to match Race Timer; fallback to realElapsedTime
    const finishMs = progress.viewerFinishTime ?? progress.realElapsedTime
    const timeInSeconds = finishMs ? (finishMs / 1000).toFixed(2) : '0.00'
    
    // Calculate points based on finish order
    // Get all finished horses and sort by real elapsed time
    const allProgress = Object.values(store.state.races.raceProgress)
    const finishedHorses = allProgress
      .filter((p: RaceProgress) => p.finished && p.realElapsedTime)
      .sort((a: RaceProgress, b: RaceProgress) => (a.realElapsedTime ?? 0) - (b.realElapsedTime ?? 0))
    
    // Find position of current horse
    const position = finishedHorses.findIndex((p: RaceProgress) => p.horseId === horseId) + 1
    const points = calculatePoints(position)
    
    return {
      finished: true,
      time: timeInSeconds,
      points
    }
  }

  /**
   * Get horses sorted by current progress (for live leaderboard)
   */
  const getSortedHorses = computed<Horse[]>(() => {
    if (!currentRound.value) return []

    const progressData = Object.values(store.state.races.raceProgress)
    interface HorseWithProgress extends Horse {
      currentProgress: number
    }

    const horsesWithProgress: HorseWithProgress[] = currentRound.value.participants.map((horse: Horse) => {
      const progress = progressData.find((p: RaceProgress) => p.horseId === horse.id)
      return {
        ...horse,
        currentProgress: progress?.progress ?? 0,
      }
    })

    return horsesWithProgress.sort((a: HorseWithProgress, b: HorseWithProgress) => 
      b.currentProgress - a.currentProgress
    )
  })

  return {
    currentRound,
    isRaceInProgress,
    raceState,
    allRaceProgress,
    getRaceProgress,
    getHorseProgress,
    getHorseFinishData,
    getSortedHorses,
    schedule,
    completedRounds,
    remainingRounds,
    allRacesCompleted,
  }
}
