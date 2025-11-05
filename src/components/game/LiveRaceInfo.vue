<template>
  <div class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 border border-racing-gold/30 shadow-xl">
    <!-- Race Progress Bar -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-racing-gold">Race Progress</span>
        <span class="text-xs text-gray-400">{{ raceElapsedTime }}s</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div
          class="bg-gradient-to-r from-racing-gold to-yellow-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${averageProgress}%` }"
        />
      </div>
    </div>

    <!-- Live Commentary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <!-- Current Leader -->
      <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl">👑</span>
          <span class="text-xs text-gray-400">Leader</span>
        </div>
        <div class="font-bold text-racing-gold truncate">
          {{ leader?.name || 'N/A' }}
        </div>
        <div class="text-xs text-gray-500">
          {{ leader ? `${leader.progress.toFixed(1)}%` : '-' }}
        </div>
      </div>

      <!-- Battle for 1st -->
      <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl">⚔️</span>
          <span class="text-xs text-gray-400">Closest Race</span>
        </div>
        <div class="font-bold text-yellow-400 text-sm truncate">
          {{ closeRaceGap }}
        </div>
        <div class="text-xs text-gray-500">
          Gap between 1st & 2nd
        </div>
      </div>

      <!-- Streak Counter -->
      <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl">🔥</span>
          <span class="text-xs text-gray-400">Excitement</span>
        </div>
        <div class="font-bold text-orange-400">
          {{ excitementLevel }}
        </div>
        <div class="text-xs text-gray-500">
          Race intensity
        </div>
      </div>
    </div>

    <!-- Live Events Feed -->
    <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700 max-h-24 overflow-y-auto">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">📢</span>
        <span class="text-xs font-semibold text-gray-300">Live Commentary</span>
      </div>
      <div class="space-y-1">
        <div
          v-for="(event, index) in liveEvents.slice(0, 3)"
          :key="index"
          class="text-xs text-gray-400 animate-fade-in"
        >
          <span class="text-racing-gold">{{ event.time }}s:</span> {{ event.message }}
        </div>
        <div
          v-if="liveEvents.length === 0"
          class="text-xs text-gray-500 italic"
        >
          Race in progress...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import type { RaceProgress, Horse } from '@/types'

interface Props {
  progressData: RaceProgress[]
  participants: Horse[]
  raceStartTime: number
}

const props = defineProps<Props>()

const liveEvents = ref<Array<{ time: number; message: string }>>([])
const raceElapsedTime = ref(0)
const previousLeader = ref<string | null>(null)
const realStartTime = ref(0)

let timer: number | null = null

// Start timer - uses REAL time independent of speed multiplier
watch(() => props.raceStartTime, (newTime) => {
  if (newTime) {
    raceElapsedTime.value = 0
    realStartTime.value = Date.now()
    if (timer) clearInterval(timer)
    // Update every 100ms for smoother display
    timer = window.setInterval(() => {
      raceElapsedTime.value = Math.floor((Date.now() - realStartTime.value) / 1000)
    }, 100)
  }
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Average progress
const averageProgress = computed(() => {
  if (props.progressData.length === 0) return 0
  const sum = props.progressData.reduce((acc, p) => acc + p.progress, 0)
  return sum / props.progressData.length
})

// Current leader
const leader = computed(() => {
  if (props.progressData.length === 0) return null
  
  const sortedProgress = [...props.progressData].sort((a, b) => b.progress - a.progress)
  const leadProgress = sortedProgress[0]
  
  const horse = props.participants.find(h => h.id === leadProgress.horseId)
  
  return horse ? {
    ...horse,
    progress: leadProgress.progress
  } : null
})

// Watch for leader changes
watch(leader, (newLeader, oldLeader) => {
  if (newLeader && oldLeader && newLeader.id !== oldLeader.id) {
    addEvent(`🏇 ${newLeader.name} takes the lead!`)
    previousLeader.value = newLeader.id
  }
})

// Close race gap
const closeRaceGap = computed(() => {
  if (props.progressData.length < 2) return 'N/A'
  
  const sorted = [...props.progressData].sort((a, b) => b.progress - a.progress)
  const gap = sorted[0].progress - sorted[1].progress
  
  return gap < 5 ? 'Tight!' : `${gap.toFixed(1)}%`
})

// Excitement level
const excitementLevel = computed(() => {
  if (props.progressData.length === 0) return 'Low'
  
  const sorted = [...props.progressData].sort((a, b) => b.progress - a.progress)
  const topThreeRange = sorted[0].progress - (sorted[2]?.progress || 0)
  
  if (topThreeRange < 10) return '🔥 INTENSE'
  if (topThreeRange < 20) return 'High'
  return 'Moderate'
})

// Watch for milestone events
watch(() => props.progressData, (newProgress) => {
  newProgress.forEach(p => {
    const horse = props.participants.find(h => h.id === p.horseId)
    if (!horse) return
    
    // Check milestones
    if (p.progress >= 50 && p.progress < 51) {
      addEvent(`${horse.name} crosses halfway mark`)
    }
    if (p.progress >= 75 && p.progress < 76) {
      addEvent(`${horse.name} entering final stretch!`)
    }
  })
}, { deep: true })

function addEvent(message: string) {
  liveEvents.value.unshift({
    time: raceElapsedTime.value,
    message
  })
  
  // Keep only last 10 events
  if (liveEvents.value.length > 10) {
    liveEvents.value = liveEvents.value.slice(0, 10)
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
