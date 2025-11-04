<template>
  <div class="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-700 h-full">
    <span class="text-lg">⚡</span>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-400">Speed:</span>
      <div class="flex gap-1">
        <button
          v-for="speed in speeds"
          :key="speed"
          class="px-2 py-1 rounded text-xs font-bold transition-all"
          :class="
            currentSpeed === speed
              ? 'bg-racing-gold text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          "
          @click="$emit('changeSpeed', speed)"
        >
          {{ speed }}x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentSpeed: number
}

defineProps<Props>()

const emit = defineEmits<{
  changeSpeed: [speed: number]
}>()

const speeds = [1, 2, 5, 10, 20, 50]
</script>

<style scoped>
.speed-btn {
  @apply px-3 py-1 rounded text-sm font-semibold transition-all;
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
}

.speed-btn.active {
  @apply bg-racing-gold text-gray-900;
}
</style>
