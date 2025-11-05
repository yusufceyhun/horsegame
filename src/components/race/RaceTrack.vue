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
        v-for="(horse, index) in getSortedHorses"
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
import { useRaceState } from '@/composables/useRaceState'
import TrackLane from './TrackLane.vue'
import HorseRunner from './HorseRunner.vue'

interface Props {
  isRunning: boolean
}

defineProps<Props>()

// Use composable for decoupled, testable access to race state
const {
  currentRound,
  getHorseProgress,
  getHorseFinishData,
  getSortedHorses,
} = useRaceState()
</script>
