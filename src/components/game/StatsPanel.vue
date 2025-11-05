<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
      📊 Game Statistics
      <button
        class="ml-auto text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
        @click="$emit('resetStats')"
      >
        Reset Stats
      </button>
    </h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <!-- Total Races -->
      <div class="stat-card">
        <div class="stat-icon">
          🏁
        </div>
        <div class="stat-value">
          {{ totalRaces }}
        </div>
        <div class="stat-label">
          Total Races
        </div>
      </div>

      <!-- Total Distance -->
      <div class="stat-card">
        <div class="stat-icon">
          📏
        </div>
        <div class="stat-value">
          {{ (totalDistance / 1000).toFixed(1) }}km
        </div>
        <div class="stat-label">
          Distance Covered
        </div>
      </div>

      <!-- Fastest Horse -->
      <div class="stat-card">
        <div class="stat-icon">
          ⚡
        </div>
        <div class="stat-value">
          {{ fastestHorse?.name || 'N/A' }}
        </div>
        <div class="stat-label">
          Fastest Horse
        </div>
      </div>

      <!-- Most Wins -->
      <div class="stat-card">
        <div class="stat-icon">
          🏆
        </div>
        <div class="stat-value">
          {{ championHorse?.name || 'N/A' }}
        </div>
        <div class="stat-label">
          Most Wins
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
        🎖️ Achievements
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-badge"
          :class="{ unlocked: achievement.unlocked }"
        >
          <div class="text-2xl mb-1">
            {{ achievement.icon }}
          </div>
          <div class="text-xs font-semibold">
            {{ achievement.name }}
          </div>
          <div class="text-xs text-gray-500">
            {{ achievement.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Chart -->
    <div>
      <h3 class="text-lg font-semibold mb-3">
        📈 Performance Trends
      </h3>
      <div class="bg-gray-800 rounded-lg p-4">
        <div class="text-sm text-gray-400 text-center">
          Average completion time: {{ averageTime.toFixed(2) }}s per race
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { RaceRound, RaceResult } from '@/types'

const store = useStore()

defineEmits<{
  resetStats: []
}>()

const totalRaces = computed(() => {
  return store.getters['races/completedRounds'].length
})

const totalDistance = computed(() => {
  const completedRounds: RaceRound[] = store.getters['races/completedRounds']
  return completedRounds.reduce(
    (sum, round) => sum + round.distance,
    0
  )
})

const fastestHorse = computed(() => {
  const results: RaceResult[] = store.state.results.roundResults
  if (!results || results.length === 0) return null
  
  const fastest = results.reduce((best: RaceResult | null, current: RaceResult) => {
    if (!best || current.completionTime < best.completionTime) return current
    return best
  }, null as RaceResult | null)
  
  if (!fastest) return null
  const horse = store.getters['horses/getHorseById'](fastest.horseId)
  return horse
})

const championHorse = computed(() => {
  return store.getters['results/championHorse']
})

const averageTime = computed(() => {
  const results: RaceResult[] = store.state.results.roundResults
  if (!results || results.length === 0) return 0
  
  const total = results.reduce((sum, r) => sum + r.completionTime, 0)
  return total / results.length / 1000 // Convert to seconds
})

const achievements = computed(() => [
  {
    id: 1,
    icon: '🎯',
    name: 'First Race',
    description: 'Complete your first race',
    unlocked: totalRaces.value >= 1,
  },
  {
    id: 2,
    icon: '🔥',
    name: 'Hot Streak',
    description: 'Complete all 6 rounds',
    unlocked: totalRaces.value >= 6,
  },
  {
    id: 3,
    icon: '💨',
    name: 'Speed Demon',
    description: 'Use 4x speed',
    unlocked: false, // Track separately
  },
  {
    id: 4,
    icon: '🌟',
    name: 'Champion',
    description: 'Have a horse win 3+ races',
    unlocked: championHorse.value?.racesParticipated >= 3,
  },
  {
    id: 5,
    icon: '📊',
    name: 'Data Analyst',
    description: 'Export race results',
    unlocked: false, // Track separately
  },
  {
    id: 6,
    icon: '🏃',
    name: 'Marathon',
    description: 'Cover 10km total distance',
    unlocked: totalDistance.value >= 10000,
  },
])
</script>

<style scoped>
.stat-card {
  @apply bg-gray-800 rounded-lg p-4 text-center border border-gray-700;
}

.stat-icon {
  @apply text-3xl mb-2;
}

.stat-value {
  @apply text-xl font-bold text-racing-gold mb-1;
}

.stat-label {
  @apply text-xs text-gray-400;
}

.achievement-badge {
  @apply bg-gray-800 rounded-lg p-3 text-center border-2 border-gray-700;
  @apply opacity-40 transition-all;
}

.achievement-badge.unlocked {
  @apply opacity-100 border-racing-gold;
}
</style>
