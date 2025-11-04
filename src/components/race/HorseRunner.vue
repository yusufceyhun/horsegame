<template>
  <div
    class="horse-runner"
    :style="{
      left: `${progress}%`,
      transform: `translateX(-50%) translateY(-50%)`,
    }"
  >
    <div
      class="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl"
      :style="{ backgroundColor: color }"
      :title="horseName"
    >
      🐎
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  color: string
  horseName: string
}

defineProps<Props>()
</script>
