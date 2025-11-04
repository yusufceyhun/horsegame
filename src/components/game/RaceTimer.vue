<template>
  <div class="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-700 h-full">
    <span class="text-2xl">⏱️</span>
    <div>
      <div class="text-xs text-gray-400">Race Time</div>
      <div class="text-xl font-mono font-bold text-racing-gold">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  raceStarted: boolean
  speedMultiplier?: number
  // If provided, this drives the timer (from composable). Otherwise we compute locally.
  elapsedMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  speedMultiplier: 1,
  elapsedMs: undefined,
})

const localElapsedMs = ref(0)
const startTime = ref(0)
let timer: number | null = null

const displayMs = computed(() => (props.elapsedMs ?? localElapsedMs.value))

// Format time as MM:SS.mm
const formattedTime = computed(() => {
  const totalSeconds = displayMs.value / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds % 1) * 100)
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
})

watch(() => props.raceStarted, (started) => {
  if (started) {
    // Start timer
    localElapsedMs.value = 0
    startTime.value = Date.now()
    
    if (props.elapsedMs === undefined) {
      if (timer) clearInterval(timer)
      timer = window.setInterval(() => {
        const realElapsed = Date.now() - startTime.value
        // Apply speed multiplier to show race time at current speed
        localElapsedMs.value = realElapsed * props.speedMultiplier
      }, 50) // Update every 50ms for smooth display
    }
  } else {
    // Stop timer
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
