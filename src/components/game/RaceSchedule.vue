<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-6">📅 Race Schedule</h2>

    <div v-if="schedule.length === 0" class="text-center text-gray-400 py-8">
      No schedule generated. Click "Generate Schedule" to create the race lineup.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RaceRoundCard
        v-for="round in schedule"
        :key="round.roundNumber"
        :round="round"
        :is-current="round.roundNumber === currentRoundIndex + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'
import RaceRoundCard from '../race/RaceRoundCard.vue'

const store = useStore()

const schedule = computed(() => store.getters['races/schedule'])
const currentRoundIndex = computed(() => store.getters['races/currentRoundIndex'])
</script>
