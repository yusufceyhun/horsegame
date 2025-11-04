<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">Round {{ roundNumber }} Results</h3>
      <span class="text-gray-400">{{ distance }}m</span>
    </div>

    <div class="space-y-2">
      <div
        v-for="result in results"
        :key="result.horseId"
        class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
        :class="{
          'bg-gradient-to-r from-yellow-600 to-yellow-700': result.position === 1,
          'bg-gradient-to-r from-gray-400 to-gray-500': result.position === 2,
          'bg-gradient-to-r from-orange-600 to-orange-700': result.position === 3,
        }"
      >
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold w-8">{{ getPositionBadge(result.position) }}</span>
          <div class="w-6 h-6 rounded-full" :style="{ backgroundColor: getHorseColor(result.horseId) }" />
          <span class="font-semibold">{{ getHorseName(result.horseId) }}</span>
        </div>
        <div class="flex items-center gap-6 text-sm">
          <span class="text-gray-300">
            {{ formatTime(result.completionTime) }}
          </span>
          <span class="font-bold text-racing-gold">{{ result.points }} pts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RaceResult, Horse } from '@/types'

interface Props {
  roundNumber: number
  distance: number
  results: RaceResult[]
  horses: Horse[]
}

const props = defineProps<Props>()

function getHorseName(horseId: string): string {
  const horse = props.horses.find((h) => h.id === horseId)
  return horse?.name || 'Unknown'
}

function getHorseColor(horseId: string): string {
  const horse = props.horses.find((h) => h.id === horseId)
  return horse?.color || '#888888'
}

function getPositionBadge(position: number): string {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return `${position}`
}

function formatTime(timestamp: number): string {
  const seconds = (timestamp / 1000).toFixed(2)
  return `${seconds}s`
}
</script>
