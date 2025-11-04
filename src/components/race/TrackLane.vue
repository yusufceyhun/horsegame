<template>
  <div class="relative h-14 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-lg overflow-hidden border border-gray-600 shadow-lg">
    <!-- Lane Number Badge -->
    <div class="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded text-gray-400 text-xs font-bold z-10 border border-gray-700">
      Lane {{ laneNumber }}
    </div>

    <!-- Track Markings - Dotted line -->
    <div class="absolute inset-0 flex items-center px-4">
      <div class="w-full border-t-2 border-dashed border-gray-600/50"></div>
    </div>

    <!-- Finish Line Indicator -->
    <div class="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-racing-gold via-yellow-500 to-racing-gold"></div>

    <!-- Horse Runner (slot content) -->
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  laneNumber?: number
}

defineProps<Props>()
</script>
