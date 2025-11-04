<template>
  <div>
    <div v-if="currentRound" class="mb-4 text-center md:text-left">
      <div class="text-sm text-gray-400">Round {{ currentRound.roundNumber }} of 6</div>
      <div class="text-lg font-semibold">{{ currentRound.distance }}m Race</div>
    </div>

    <div v-if="currentRound" class="space-y-2 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 overflow-x-auto shadow-2xl">
      <TrackLane
        v-for="(horse, index) in currentRound.participants"
        :key="horse.id"
        :lane-number="index + 1"
      >
        <HorseRunner
          :progress="getHorseProgress(horse.id)"
          :color="horse.color"
          :horse-name="horse.name"
        />
        <!-- Show finish time when horse completes -->
        <div
          v-if="getHorseFinishData(horse.id).finished"
          class="absolute right-20 top-1/2 -translate-y-1/2 bg-gradient-to-r from-racing-gold to-yellow-500 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-xl border-2 border-yellow-300 animate-bounce-in"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">🏁</span>
            <div class="flex flex-col leading-tight">
              <span class="text-xs opacity-75">Finished</span>
              <span>{{ getHorseFinishData(horse.id).time }}s</span>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="text-xs opacity-75">Points</span>
              <span class="font-extrabold">{{ getHorseFinishData(horse.id).points }}</span>
            </div>
          </div>
        </div>
      </TrackLane>
    </div>

    <div v-else class="text-center text-gray-400 py-8 md:py-12">
      <p class="text-base md:text-lg">No active race. Generate a schedule to begin!</p>
    </div>

    <!-- Live Leaderboard during race - Mobile optimized -->
    <div v-if="isRunning && currentRound" class="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      <div
        v-for="(horse, index) in sortedHorses"
        :key="horse.id"
        class="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg text-sm"
        :class="{
          'bg-yellow-700': index === 0,
          'bg-gray-600': index === 1,
          'bg-orange-700': index === 2,
        }"
      >
        <span class="font-bold">{{ index + 1 }}.</span>
        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: horse.color }" />
        <span class="truncate">{{ horse.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import TrackLane from './TrackLane.vue'
import HorseRunner from './HorseRunner.vue'
import type { Horse, RaceProgress } from '@/types'

interface Props {
  isRunning: boolean
}

defineProps<Props>()

const store = useStore()

const currentRound = computed(() => store.getters['races/currentRound'])

function getHorseProgress(horseId: string): number {
  const state = store.state.races as any
  const progress = state.raceProgress.get(horseId)
  return progress?.progress || 0
}

interface FinishData {
  finished: boolean
  time: string
  points: number
}

function getHorseFinishData(horseId: string): FinishData {
  const state = store.state.races as any
  const progress = state.raceProgress.get(horseId)
  
  if (!progress || !progress.finished) {
    return { finished: false, time: '0.00', points: 0 }
  }
  
  // Prefer viewerFinishTime to match Race Timer; fallback to realElapsedTime
  const finishMs = progress.viewerFinishTime ?? progress.realElapsedTime
  const timeInSeconds = finishMs ? (finishMs / 1000).toFixed(2) : '0.00'
  
  // Calculate points based on finish order
  // Get all finished horses and sort by real elapsed time
  const allProgress = Array.from(state.raceProgress.values() as any) as RaceProgress[]
  const finishedHorses = allProgress
    .filter(p => p.finished && p.realElapsedTime)
    .sort((a, b) => (a.realElapsedTime || 0) - (b.realElapsedTime || 0))
  
  // Find position of current horse
  const position = finishedHorses.findIndex(p => p.horseId === horseId) + 1
  
  // Calculate points based on position (same as calculatePoints in race-engine)
  const pointsMap: Record<number, number> = {
    1: 10, 2: 8, 3: 6, 4: 5, 5: 4,
    6: 3, 7: 2, 8: 1, 9: 1, 10: 1,
  }
  const points = pointsMap[position] || 0
  
  return {
    finished: true,
    time: timeInSeconds,
    points
  }
}

const sortedHorses = computed((): Horse[] => {
  if (!currentRound.value) return []

  const state = store.state.races as any
  const progressData = Array.from(state.raceProgress.values()) as RaceProgress[]
  const horsesWithProgress = currentRound.value.participants.map((horse: Horse) => {
    const progress = progressData.find((p: RaceProgress) => p.horseId === horse.id)
    return {
      ...horse,
      currentProgress: progress?.progress || 0,
    }
  })

  return horsesWithProgress.sort((a: any, b: any) => b.currentProgress - a.currentProgress)
})
</script>
