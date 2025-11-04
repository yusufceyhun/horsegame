<template>
  <div class="card">
    <!-- Error/Warning Message -->
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
      <p class="text-red-200 font-semibold">⚠️ {{ errorMessage }}</p>
    </div>

    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold mb-2">🏇 Horse Racing Game</h2>
        <p class="text-gray-400">{{ statusMessage }}</p>
      </div>

      <div class="flex gap-4">
        <button
          class="btn-primary"
          :disabled="isGenerateDisabled"
          @click="handleGenerateSchedule"
        >
          Generate Schedule
        </button>

        <button
          class="btn-primary"
          :disabled="isStartDisabled"
          @click="handleStartRace"
        >
          {{ startButtonText }}
        </button>

        <button
          v-if="schedule.length > 0"
          class="btn-secondary"
          @click="handleReset"
        >
          Reset Game
        </button>
      </div>
    </div>

    <!-- Progress indicator -->
    <div v-if="schedule.length > 0" class="mt-6">
      <div class="flex items-center justify-between text-sm text-gray-400 mb-2">
        <span>Round Progress</span>
        <span>{{ currentRoundIndex + 1 }} / {{ schedule.length }}</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-3">
        <div
          class="bg-racing-gold h-3 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from '@/store'
import { RaceState } from '@/types'
import { MIN_HORSES_FOR_RACE } from '@/utils/constants'

const emit = defineEmits<{
  generateSchedule: []
  startRace: []
}>()

const store = useStore()
const errorMessage = ref<string>('')

const schedule = computed(() => store.getters['races/schedule'])
const currentRoundIndex = computed(() => store.getters['races/currentRoundIndex'])
const raceState = computed(() => store.getters['races/raceState'])
const isRaceInProgress = computed(() => store.getters['races/isRaceInProgress'])
const allRacesCompleted = computed(() => store.getters['races/allRacesCompleted'])
const completedRounds = computed(() => store.getters['races/completedRounds'])
const horseCount = computed(() => store.getters['horses/horseCount'])
const hasEnoughHorses = computed(() => store.getters['horses/hasEnoughHorsesForRace'])

const isGenerateDisabled = computed(() => {
  return isRaceInProgress.value || raceState.value === RaceState.SCHEDULE_READY
})

const isStartDisabled = computed(() => {
  return (
    schedule.value.length === 0 ||
    isRaceInProgress.value ||
    allRacesCompleted.value
  )
})

const startButtonText = computed(() => {
  if (raceState.value === RaceState.RACE_COMPLETED) {
    return 'Start Next Round'
  }
  return 'Start Race'
})

const statusMessage = computed(() => {
  switch (raceState.value) {
    case RaceState.IDLE:
      return 'Click "Generate Schedule" to begin'
    case RaceState.SCHEDULE_READY:
      return `Ready to start Round ${currentRoundIndex.value + 1}`
    case RaceState.RACE_IN_PROGRESS:
      return `Race in progress - Round ${currentRoundIndex.value + 1}`
    case RaceState.RACE_COMPLETED:
      return `Round ${currentRoundIndex.value + 1} completed!`
    case RaceState.ALL_RACES_COMPLETED:
      return 'All races completed! 🏆'
    default:
      return ''
  }
})

const progressPercentage = computed(() => {
  const completed = completedRounds.value.length
  const total = schedule.value.length
  return total > 0 ? (completed / total) * 100 : 0
})

async function handleGenerateSchedule() {
  try {
    errorMessage.value = ''
    await store.dispatch('horses/generateHorses')
    
    // Check if we have enough horses
    if (!hasEnoughHorses.value) {
      errorMessage.value = `Only ${horseCount.value} horse(s) generated. At least ${MIN_HORSES_FOR_RACE} horses are required to start a race. Please click "Generate Schedule" again.`
      return
    }
    
    await store.dispatch('races/generateSchedule')
    await store.dispatch('results/clearResults')
    emit('generateSchedule')
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to generate schedule'
  }
}

function handleStartRace() {
  if (raceState.value === RaceState.RACE_COMPLETED) {
    store.dispatch('races/nextRound')
  }
  emit('startRace')
}

function handleReset() {
  store.dispatch('races/resetGame')
  store.dispatch('horses/clearHorses')
  store.dispatch('results/clearResults')
}
</script>
