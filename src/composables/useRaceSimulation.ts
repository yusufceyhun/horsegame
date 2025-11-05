/**
 * Race Simulation Composable
 * Handles race timing, progression logic, and result calculation
 */

import { ref, computed } from 'vue'
import type { Horse, RaceProgress } from '@/types'
import { useStore } from '@/store'
import {
  calculateHorseSpeed,
  calculateProgressIncrement,
  calculatePoints,
} from '@/utils/race-engine'
import { FRAME_DURATION } from '@/utils/constants'

export function useRaceSimulation() {
  const store = useStore()

  const isRunning = ref(false)
  const animationFrameId = ref<number | null>(null)
  const lastFrameTime = ref<number>(0)
  const raceStartTime = ref<number>(0) // Real race start time (independent of speed)
  const speedMultiplier = ref(1) // 1x, 2x, 5x, 10x, 20x speed (visual only)
  // Track elapsed time
  const realElapsedMs = ref(0)
  const viewerElapsedMs = ref(0)

  const currentProgress = computed((): RaceProgress[] => {
    return Object.values(store.state.races.raceProgress)
  })

  /**
   * Initialize race with horses and their speeds
   * Calculate expected finish time based on physics (distance / speed)
   */
  function initializeRace(horses: Horse[], distance: number) {
    raceStartTime.value = Date.now() // Record real start time for ALL horses
    
    // CRITICAL: Clear any existing race progress to prevent data contamination
    store.dispatch('races/clearRaceProgress')
    
    horses.forEach((horse: Horse, index: number) => {
      // Always use the latest horse state from the store to account for fatigue/rest
      const latest: Horse | undefined = store.getters['horses/getHorseById'](horse.id)
      const source = latest ?? horse
      const speed = calculateHorseSpeed(source, distance) // meters per second
      
      // Calculate expected finish time based on distance and speed (physics)
      // This is the REAL race time, independent of animation speed multiplier
      let expectedFinishTime = (distance / speed) * 1000 // Convert to milliseconds
      
      // Add variance based on multiple factors to ensure ABSOLUTELY unique times
      // 1. Index-based variance (deterministic but unique per position)
      // 2. Random variance (stochastic element)
      // 3. Speed-based micro-adjustment (faster horses get slightly more variance range)
      const indexVariance = index * 10 // 0ms, 10ms, 20ms, etc.
      const randomVariance = Math.random() * 100 - 50 // ±50ms random
      const speedVariance = (speed / 10) * (Math.random() - 0.5) // Speed-proportional variance
      
      expectedFinishTime += indexVariance + randomVariance + speedVariance
      
      // Per-horse variance profile (for dynamic pacing)
      const variance = {
        staminaDecay: 0.05 + Math.random() * 0.1, // 0.05–0.15
        surgeAmp: Math.random() * 0.06, // 0.00–0.06
        phase: Math.random() * Math.PI * 2,
      }

      store.dispatch('races/updateRaceProgress', {
        horseId: horse.id,
        progress: {
          horseId: horse.id,
          progress: 0,
          speed,
          finished: false,
          finishTime: null, // Will be set when horse finishes (animation time)
          realElapsedTime: null, // Will be set when horse finishes
          expectedFinishTime, // Pre-calculated baseline
          viewerFinishTime: null,
          variance,
        },
      })
    })
  }

  /**
   * Animation loop for race progression
   */
  function animate(timestamp: number) {
    if (!isRunning.value) return

    const deltaTime = lastFrameTime.value === 0 ? FRAME_DURATION : timestamp - lastFrameTime.value
    lastFrameTime.value = timestamp
    
    // Apply speed multiplier for faster playback (doesn't affect finish times)
    const adjustedDeltaTime = deltaTime * speedMultiplier.value

    // Advance global timers
    realElapsedMs.value += deltaTime
    viewerElapsedMs.value += adjustedDeltaTime

    const currentRound = store.getters['races/currentRound']
    if (!currentRound) {
      stopRace()
      return
    }

    let allFinished = true
    const progressArray = currentProgress.value

    progressArray.forEach((progress: RaceProgress) => {
      if (!progress.finished) {
        // Dynamic pacing: stamina decay + surges unique per horse
        const pNorm = Math.max(0, Math.min(1, progress.progress / 100))
        const v = progress.variance
        const dynamicFactor = v
          ? Math.max(0.85, 1 - v.staminaDecay * pNorm + Math.sin(v.phase + pNorm * Math.PI * 2) * v.surgeAmp)
          : 1

        const effSpeed = progress.speed * dynamicFactor
        const increment = calculateProgressIncrement(effSpeed, currentRound.distance, adjustedDeltaTime)
        const newProgress = Math.min(100, progress.progress + increment)

        const updatedProgress: RaceProgress = {
          ...progress,
          progress: newProgress,
          finished: newProgress >= 100,
        }

        // Set finish time when horse crosses finish line
        if (updatedProgress.finished && !progress.finished) {
          updatedProgress.finishTime = timestamp // Animation timestamp
          // Capture global timers at this exact moment
          // Use real elapsed (independent of speed) and viewer elapsed (scaled by speed)
          // Deduplicate realElapsed to avoid identical ms due to frame alignment
          const allProgress = Object.values(store.state.races.raceProgress)
          // Track used hundredth-of-a-second buckets to avoid 64.00-style bunching
          const usedHundredths = new Set(
            allProgress
              .filter((p: RaceProgress) => p.finished && p.realElapsedTime != null)
              .map((p: RaceProgress) => Math.floor((p.realElapsedTime as number) / 10))
          )
          let rt = realElapsedMs.value
          let bucket = Math.floor(rt / 10)
          while (usedHundredths.has(bucket)) {
            rt += 5 + Math.random() * 10 // jump 5–15ms to next available hundredth bucket
            bucket = Math.floor(rt / 10)
          }
          updatedProgress.realElapsedTime = rt
          updatedProgress.viewerFinishTime = viewerElapsedMs.value
          updatedProgress.expectedFinishTime = progress.expectedFinishTime
        } else if (progress.finished) {
          // Preserve existing finish times for already finished horses
          updatedProgress.finishTime = progress.finishTime
          updatedProgress.realElapsedTime = progress.realElapsedTime
          updatedProgress.viewerFinishTime = progress.viewerFinishTime
          updatedProgress.expectedFinishTime = progress.expectedFinishTime
        }

        store.dispatch('races/updateRaceProgress', {
          horseId: progress.horseId,
          progress: updatedProgress,
        })

        if (!updatedProgress.finished) {
          allFinished = false
        }
      }
    })

    if (allFinished) {
      completeRace()
    } else {
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }

  /**
   * Start the race
   */
  function startRace() {
    const currentRound = store.getters['races/currentRound']
    if (!currentRound) {
      throw new Error('No current round to start')
    }

    store.dispatch('races/startRace')
    initializeRace(currentRound.participants, currentRound.distance)
    
    // Reset timers for UI and physics
    realElapsedMs.value = 0
    viewerElapsedMs.value = 0
    isRunning.value = true
    lastFrameTime.value = 0
    animationFrameId.value = requestAnimationFrame(animate)
  }

  /**
   * Stop the race
   */
  function stopRace() {
    isRunning.value = false
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  /**
   * Complete race and record results
   */
  function completeRace() {
    stopRace()

    const currentRound = store.getters['races/currentRound']
    if (!currentRound) return

    // Sort by REAL elapsed time (independent of speed multiplier) to determine positions
    const sortedProgress = currentProgress.value.sort((a: RaceProgress, b: RaceProgress) => {
      if (!a.realElapsedTime) return 1
      if (!b.realElapsedTime) return -1
      return a.realElapsedTime - b.realElapsedTime
    })

    // Create race results with points using REAL elapsed time
    const results = sortedProgress.map((progress: RaceProgress, index: number) => {
      const points = calculatePoints(index + 1)
      return {
        roundNumber: currentRound.roundNumber,
        horseId: progress.horseId,
        position: index + 1,
        // Use viewer finish time to match on-track badge and RaceTimer
        completionTime: progress.viewerFinishTime ?? progress.realElapsedTime ?? 0,
        finalSpeed: progress.speed,
        points,
      }
    })

    // Store results
    currentRound.results = results
    store.dispatch('results/recordRoundResults', results)
    store.dispatch('races/completeCurrentRound')

    // Apply fatigue to participants
    const participantIds = currentRound.participants.map((h: Horse) => h.id)
    store.dispatch('horses/applyFatigueToHorses', participantIds)

    // Apply rest recovery to non-participants
    const allHorses: Horse[] = store.getters['horses/horses']
    const restIds = allHorses
      .map((h) => h.id)
      .filter((id) => !participantIds.includes(id))
    if (restIds.length > 0) {
      store.dispatch('horses/applyRestRecoveryToHorses', restIds)
    }
  }

  function setSpeed(multiplier: number) {
    speedMultiplier.value = multiplier
  }

  return {
    isRunning,
    currentProgress,
    speedMultiplier,
    realElapsedMs,
    viewerElapsedMs,
    startRace,
    stopRace,
    completeRace,
    setSpeed,
  }
}
