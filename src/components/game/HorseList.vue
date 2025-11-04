<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      🐴 Horse Roster ({{ horses.length }}/20)
    </h2>
    
    <!-- Legend explaining selection indicator -->
    <div class="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <div class="flex items-center gap-3 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded border-4 border-yellow-500 shadow-lg shadow-yellow-500/50"></div>
          <span class="text-gray-300">= Selected for current race (10 horses per round)</span>
        </div>
      </div>
    </div>

    <div v-if="horses.length === 0" class="text-center text-gray-400 py-8">
      No horses generated yet. Click "Generate Schedule" to create the roster.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <HorseCard
        v-for="horse in horses"
        :key="horse.id"
        :horse="horse"
        :is-selected="isHorseSelected(horse.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import HorseCard from '../horses/HorseCard.vue'
import type { Horse } from '@/types'

const store = useStore()

const horses = computed(() => store.getters['horses/horses'])

function isHorseSelected(horseId: string): boolean {
  const currentRound = store.getters['races/currentRound']
  if (!currentRound) return false
  return currentRound.participants.some((h: Horse) => h.id === horseId)
}
</script>
