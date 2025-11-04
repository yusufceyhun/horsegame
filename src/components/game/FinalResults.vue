<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-racing-gold">
      <!-- Header -->
      <div class="bg-gradient-to-r from-racing-gold to-yellow-600 p-6 text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🏆 Race Championship Complete!</h1>
        <p class="text-gray-800 font-semibold">All 6 Rounds Finished</p>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <!-- Champion -->
        <div v-if="champion" class="mb-8 text-center">
          <div class="inline-block p-6 bg-gradient-to-br from-yellow-500/20 to-racing-gold/20 rounded-xl border-2 border-racing-gold">
            <div class="text-6xl mb-3">👑</div>
            <h2 class="text-3xl font-bold text-racing-gold mb-2">{{ champion.horseName }}</h2>
            <div class="flex items-center justify-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full border-2 border-racing-gold" :style="{ backgroundColor: champion.horseColor }"></div>
              <span class="text-2xl font-bold text-white">{{ champion.totalPoints }} Points</span>
            </div>
            <div class="text-sm text-gray-400">
              {{ champion.racesParticipated }} races • Avg Position: {{ champion.averagePosition.toFixed(1) }}
            </div>
          </div>
        </div>

        <!-- Top 10 Standings -->
        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 class="text-2xl font-bold mb-4 text-center">🏅 Final Standings</h3>
          
          <div class="space-y-2">
            <div
              v-for="(standing, index) in standings"
              :key="standing.horseId"
              class="flex items-center gap-4 p-3 rounded-lg transition-all"
              :class="{
                'bg-gradient-to-r from-yellow-500/30 to-racing-gold/30 border-2 border-racing-gold': index === 0,
                'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-600': index === 1,
                'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700': index === 2,
                'bg-gray-700/30': index > 2
              }"
            >
              <!-- Position -->
              <div class="text-2xl font-bold w-12 text-center" :class="{
                'text-racing-gold': index === 0,
                'text-gray-300': index === 1,
                'text-orange-400': index === 2,
                'text-gray-500': index > 2
              }">
                {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}` }}
              </div>

              <!-- Horse Color -->
              <div class="w-10 h-10 rounded-full border-2" 
                   :class="index < 3 ? 'border-white' : 'border-gray-600'"
                   :style="{ backgroundColor: standing.horseColor }"></div>

              <!-- Horse Name -->
              <div class="flex-1">
                <div class="font-bold text-lg">{{ standing.horseName }}</div>
                <div class="text-xs text-gray-400">
                  {{ standing.racesParticipated }} races • Best: {{ getPositionSuffix(standing.bestPosition) }}
                </div>
              </div>

              <!-- Points -->
              <div class="text-right">
                <div class="text-2xl font-bold" :class="index < 3 ? 'text-racing-gold' : 'text-white'">
                  {{ standing.totalPoints }}
                </div>
                <div class="text-xs text-gray-400">points</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Race Summary Stats -->
        <div class="mt-6 grid grid-cols-3 gap-4">
          <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
            <div class="text-3xl mb-2">🏁</div>
            <div class="text-2xl font-bold text-racing-gold">6</div>
            <div class="text-sm text-gray-400">Rounds</div>
          </div>
          <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
            <div class="text-3xl mb-2">🐴</div>
            <div class="text-2xl font-bold text-racing-gold">{{ totalHorses }}</div>
            <div class="text-sm text-gray-400">Total Horses</div>
          </div>
          <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
            <div class="text-3xl mb-2">📊</div>
            <div class="text-2xl font-bold text-racing-gold">{{ totalRaces }}</div>
            <div class="text-sm text-gray-400">Races Run</div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 bg-gray-900/50 border-t border-gray-700 flex gap-4 justify-center">
        <button
          class="px-6 py-3 bg-racing-gold hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105"
          @click="$emit('new-game')"
        >
          🎮 New Game
        </button>
        <button
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
          @click="$emit('view-results')"
        >
          📊 View Detailed Results
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import type { HorseStanding } from '@/types'

interface Props {
  standings: HorseStanding[]
}

const props = defineProps<Props>()
const store = useStore()

defineEmits<{
  (e: 'new-game'): void
  (e: 'view-results'): void
}>()

const champion = computed(() => props.standings[0])

const totalRaces = computed(() => {
  return props.standings.reduce((sum, standing) => sum + standing.racesParticipated, 0) / 10
})

const totalHorses = computed(() => {
  return store.getters['horses/horseCount']
})

function getPositionSuffix(position: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = position % 100
  return position + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}
</script>
