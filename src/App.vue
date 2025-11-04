<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-2 sm:p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-4 md:space-y-8">
      <!-- Header -->
      <header class="text-center py-4 md:py-8">
        <h1 class="text-3xl md:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-racing-gold to-yellow-500 bg-clip-text text-transparent">
          🏇 Horse Racing Simulator
        </h1>
        <p class="text-gray-400 text-sm md:text-lg">
          Enterprise-grade racing simulation with Vue 3, TypeScript, and Vuex
        </p>
      </header>

      <!-- Game Controls -->
      <GameControls @generate-schedule="onGenerateSchedule" @start-race="onStartRace" />

      <!-- Race Track with Speed Control and Timer -->
      <div class="card">
        <div class="flex flex-col md:flex-row md:items-stretch justify-between mb-4 gap-4">
          <h2 class="text-2xl font-bold">🏁 Race Track</h2>
          <div class="flex items-stretch gap-4 flex-wrap">
            <RaceTimer 
              v-if="raceSimulation.isRunning.value" 
              :race-started="raceSimulation.isRunning.value"
              :speed-multiplier="raceSimulation.speedMultiplier.value"
              :elapsed-ms="raceSimulation.viewerElapsedMs.value"
            />
            <SpeedControl
              v-if="raceSimulation.isRunning.value"
              :current-speed="raceSimulation.speedMultiplier.value"
              @change-speed="raceSimulation.setSpeed"
            />
          </div>
        </div>
        <RaceTrack :is-running="raceSimulation.isRunning.value" />
      </div>

      <!-- Tabs Section -->
      <div class="card">
        <div class="flex gap-2 md:gap-4 border-b border-gray-700 pb-3 md:pb-4 mb-4 md:mb-6 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm md:text-base"
            :class="
              activeTab === tab.id
                ? 'bg-racing-gold text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            "
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div>
          <HorseList v-show="activeTab === 'horses'" />
          <RaceSchedule v-show="activeTab === 'schedule'" />
          <ResultsPanel v-if="activeTab === 'results'" />
        </div>
      </div>

      <!-- Footer -->
      <footer class="text-center text-gray-500 text-sm py-8">
        <p>
          Built with Vue 3 + TypeScript + Vuex | Demonstrating SOLID principles & clean architecture
        </p>
        <p class="mt-2">
          © {{ new Date().getFullYear() }} - Professional Frontend Assessment Project
        </p>
      </footer>
    </div>

    <!-- Final Results Modal -->
    <FinalResults
      v-if="showFinalResults"
      :standings="store.getters['results/sortedStandings']"
      @new-game="handleNewGame"
      @view-results="handleViewResults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from './store'
import { useRaceSimulation } from './composables/useRaceSimulation'
import GameControls from './components/game/GameControls.vue'
import RaceTrack from './components/race/RaceTrack.vue'
import HorseList from './components/game/HorseList.vue'
import RaceSchedule from './components/game/RaceSchedule.vue'
import ResultsPanel from './components/game/ResultsPanel.vue'
import SpeedControl from './components/game/SpeedControl.vue'
import RaceTimer from './components/game/RaceTimer.vue'
import FinalResults from './components/game/FinalResults.vue'

const store = useStore()
const raceSimulation = useRaceSimulation()

// Track if all races are complete
const showFinalResults = ref(false)
const allRacesComplete = computed(() => {
  const completedRounds = store.getters['races/completedRounds']
  return completedRounds.length === 6
})

// Watch for all races complete
watch(allRacesComplete, (complete: boolean) => {
  if (complete) {
    // Delay showing final results by 1 second for better UX
    setTimeout(() => {
      showFinalResults.value = true
    }, 1000)
  }
})

const activeTab = ref<'horses' | 'schedule' | 'results'>('horses')

const tabs = [
  { id: 'horses' as const, label: '🐴 Horses' },
  { id: 'schedule' as const, label: '📅 Schedule' },
  { id: 'results' as const, label: '🏆 Results' },
]

function onGenerateSchedule() {
  activeTab.value = 'schedule'
}

function onStartRace() {
  activeTab.value = 'schedule'
  raceSimulation.startRace()
}

function handleNewGame() {
  showFinalResults.value = false
  store.dispatch('results/clearResults')
  store.dispatch('races/resetGame')
  store.dispatch('horses/clearHorses')
  activeTab.value = 'horses'
}

function handleViewResults() {
  showFinalResults.value = false
  activeTab.value = 'results'
}
</script>
