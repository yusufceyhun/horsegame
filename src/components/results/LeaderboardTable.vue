<template>
  <div class="card">
    <h3 class="text-2xl font-bold mb-6 flex items-center gap-2">
      <span>🏆</span>
      Overall Standings
    </h3>

    <div
      v-if="standings.length === 0"
      class="text-center text-gray-400 py-8"
    >
      No results yet. Complete races to see standings!
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full">
        <thead class="bg-gray-700">
          <tr>
            <th class="px-4 py-3 text-left">
              Rank
            </th>
            <th class="px-4 py-3 text-left">
              Horse
            </th>
            <th class="px-4 py-3 text-center">
              Races
            </th>
            <th class="px-4 py-3 text-center">
              Points
            </th>
            <th class="px-4 py-3 text-center">
              Best
            </th>
            <th class="px-4 py-3 text-center">
              Avg Position
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(standing, index) in standings"
            :key="standing.horseId"
            class="border-b border-gray-700 hover:bg-gray-700 transition-colors"
            :class="{
              'bg-yellow-900 bg-opacity-20': index === 0,
              'bg-gray-800 bg-opacity-50': index === 1,
              'bg-orange-900 bg-opacity-20': index === 2,
            }"
          >
            <td class="px-4 py-3">
              <span class="text-xl font-bold">{{ getRankBadge(index + 1) }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full"
                  :style="{ backgroundColor: standing.horseColor }"
                />
                <span class="font-semibold">{{ standing.horseName }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              {{ standing.racesParticipated }}
            </td>
            <td class="px-4 py-3 text-center">
              <span class="font-bold text-racing-gold">{{ standing.totalPoints }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-green-400">{{ standing.bestPosition }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              {{ standing.averagePosition.toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HorseStanding } from '@/types'

interface Props {
  standings: HorseStanding[]
}

defineProps<Props>()

function getRankBadge(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}
</script>
