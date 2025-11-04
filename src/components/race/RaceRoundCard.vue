<template>
  <div
    class="card"
    :class="{
      'border-racing-gold': isCurrent,
      'border-green-500': round.status === 'COMPLETED',
      'opacity-50': round.status === 'PENDING' && !isCurrent,
    }"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-xl font-bold">Round {{ round.roundNumber }}</h3>
        <p class="text-gray-400">{{ round.distance }}m</p>
      </div>
      <div>
        <span
          class="px-3 py-1 rounded-full text-sm font-semibold"
          :class="statusClass"
        >
          {{ round.status }}
        </span>
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-sm text-gray-400 mb-2">Participants:</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="horse in round.participants"
          :key="horse.id"
          class="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full text-sm"
        >
          <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: horse.color }" />
          <span>{{ horse.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="round.results.length > 0" class="mt-4 pt-4 border-t border-gray-700">
      <div class="text-sm text-gray-400 mb-2">Results:</div>
      <div class="space-y-1">
        <div
          v-for="result in round.results.slice(0, 3)"
          :key="result.horseId"
          class="flex items-center justify-between text-sm"
        >
          <span>{{ getPositionBadge(result.position) }} {{ getHorseName(result.horseId) }}</span>
          <span class="text-gray-400">{{ result.points }} pts</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RaceRound } from '@/types'

interface Props {
  round: RaceRound
  isCurrent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
})

const statusClass = computed(() => {
  switch (props.round.status) {
    case 'COMPLETED':
      return 'bg-green-500 text-gray-900'
    case 'IN_PROGRESS':
      return 'bg-racing-gold text-gray-900'
    default:
      return 'bg-gray-600 text-gray-300'
  }
})

function getHorseName(horseId: string): string {
  const horse = props.round.participants.find((h) => h.id === horseId)
  return horse?.name || 'Unknown'
}

function getPositionBadge(position: number): string {
  const badges = ['🥇', '🥈', '🥉']
  return badges[position - 1] || `#${position}`
}
</script>
