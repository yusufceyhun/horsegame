<template>
  <div class="space-y-6">
    <!-- Overall Standings -->
    <LeaderboardTable :standings="sortedStandings" />

    <!-- Round Results - Accordion Style for Better UX -->
    <div
      v-if="hasResults"
      class="card"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">
          📊 Round Results
        </h2>
        <button 
          class="text-sm text-racing-gold hover:text-yellow-400 transition-colors"
          @click="toggleAllRounds"
        >
          {{ allExpanded ? 'Collapse All' : 'Expand All' }}
        </button>
      </div>

      <div class="space-y-2">
        <div 
          v-for="round in completedRounds" 
          :key="round.roundNumber"
          class="border border-gray-700 rounded-lg overflow-hidden"
        >
          <!-- Round Header - Clickable -->
          <button
            class="w-full px-4 py-3 flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
            @click="toggleRound(round.roundNumber)"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-racing-gold">Round {{ round.roundNumber }}</span>
              <span class="text-sm text-gray-400">{{ round.distance }}m</span>
              <span class="text-xs text-gray-500">{{ round.results.length }} horses</span>
            </div>
            <span
              class="text-gray-400 transition-transform"
              :class="{ 'rotate-180': expandedRounds.has(round.roundNumber) }"
            >
              ▼
            </span>
          </button>
          
          <!-- Round Results - Collapsible -->
          <div
            v-if="expandedRounds.has(round.roundNumber)"
            class="p-4 bg-gray-900/30"
          >
            <RoundResult
              :round-number="round.roundNumber"
              :distance="round.distance"
              :results="round.results"
              :horses="horses"
            />
          </div>
        </div>
      </div>

      <!-- Export Results -->
      <div class="mt-6 pt-6 border-t border-gray-700">
        <button
          class="btn-secondary w-full md:w-auto"
          @click="handleExport"
        >
          📥 Export Results as JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/store'
import type { RaceRound } from '@/types'
import LeaderboardTable from '../results/LeaderboardTable.vue'
import RoundResult from '../results/RoundResult.vue'

const store = useStore()

const sortedStandings = computed(() => store.getters['results/sortedStandings'])
const hasResults = computed(() => store.getters['results/hasResults'])
const completedRounds = computed(() => store.getters['races/completedRounds'])
const horses = computed(() => store.getters['horses/horses'])

// Accordion state for better UX (issue #3)
const expandedRounds = ref<Set<number>>(new Set())
const allExpanded = computed(() => expandedRounds.value.size === completedRounds.value.length)

// Auto-expand the latest round
watch(completedRounds, (newRounds: RaceRound[]) => {
  if (newRounds.length > 0) {
    const latestRound = newRounds[newRounds.length - 1]
    expandedRounds.value.add(latestRound.roundNumber)
  }
}, { immediate: true })

function toggleRound(roundNumber: number) {
  if (expandedRounds.value.has(roundNumber)) {
    expandedRounds.value.delete(roundNumber)
  } else {
    expandedRounds.value.add(roundNumber)
  }
  // Trigger reactivity
  expandedRounds.value = new Set(expandedRounds.value)
}

function toggleAllRounds() {
  if (allExpanded.value) {
    expandedRounds.value.clear()
  } else {
    expandedRounds.value = new Set(completedRounds.value.map((r: RaceRound) => r.roundNumber))
  }
}

async function handleExport() {
  const json = await store.dispatch('results/exportResults')
  const blob = new Blob([json as string], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `race-results-${new Date().toISOString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
