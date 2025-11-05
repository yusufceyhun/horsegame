<template>
  <div
    class="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border transition-all"
    :class="{
      'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20': isSelected,
      'border-gray-700 hover:border-gray-600 hover:bg-gray-800/70': !isSelected
    }"
  >
    <!-- Horse Color Circle -->
    <div 
      class="flex-shrink-0 w-12 h-12 rounded-full border-2"
      :class="isSelected ? 'border-yellow-500' : 'border-gray-600'"
      :style="{ backgroundColor: horse.color }" 
    />
    
    <!-- Horse Info -->
    <div class="flex-1 min-w-0">
      <h3 class="font-bold text-base truncate">
        {{ horse.name }}
      </h3>
      <p class="text-xs text-gray-500">
        ID: {{ horse.id }}
      </p>
    </div>
    
    <!-- Condition Badge -->
    <div class="flex-shrink-0 flex flex-col items-center gap-1">
      <div 
        class="px-3 py-1 rounded-full text-xs font-bold"
        :class="{
          'bg-green-500/20 text-green-400': horse.condition >= 80,
          'bg-yellow-500/20 text-yellow-400': horse.condition >= 50 && horse.condition < 80,
          'bg-red-500/20 text-red-400': horse.condition < 50
        }"
      >
        {{ horse.condition }}
      </div>
      <div class="text-xs text-gray-500">
        condition
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Horse } from '@/types'

interface Props {
  horse: Horse
  isSelected?: boolean
}

withDefaults(defineProps<Props>(), {
  isSelected: false,
})
</script>
