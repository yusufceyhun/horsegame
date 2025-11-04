<template>
  <div v-if="recentAchievements.length > 0" class="fixed top-20 right-4 z-50 space-y-2">
    <TransitionGroup name="achievement">
      <div
        v-for="achievement in recentAchievements"
        :key="achievement.id"
        class="achievement-popup"
      >
        <div class="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg p-4 shadow-2xl border-2 border-yellow-400">
          <span class="text-3xl">{{ achievement.icon }}</span>
          <div>
            <div class="font-bold text-sm">Achievement Unlocked!</div>
            <div class="text-xs opacity-90">{{ achievement.name }}</div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>

  <!-- Combo Multiplier -->
  <div v-if="comboMultiplier > 1" class="fixed bottom-24 right-4 z-50">
    <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-3 shadow-2xl border-2 border-purple-400 animate-pulse">
      <div class="text-center">
        <div class="text-2xl font-bold">{{ comboMultiplier }}x</div>
        <div class="text-xs">COMBO!</div>
      </div>
    </div>
  </div>

  <!-- Streak Indicator -->
  <div v-if="currentStreak > 0" class="fixed bottom-4 right-4 z-50">
    <div class="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg px-4 py-2 shadow-2xl border-2 border-orange-400">
      <div class="flex items-center gap-2">
        <span class="text-xl">🔥</span>
        <div>
          <div class="text-xs font-semibold">Win Streak</div>
          <div class="text-lg font-bold">{{ currentStreak }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Achievement {
  id: number
  icon: string
  name: string
}

interface Props {
  isRaceActive: boolean
  raceCount: number
  speedUsed: number
}

const props = defineProps<Props>()

const recentAchievements = ref<Achievement[]>([])
const comboMultiplier = ref(1)
const currentStreak = ref(0)

// Track achievements
const achievementsUnlocked = ref<Set<string>>(new Set())

watch(() => props.speedUsed, (speed) => {
  if (speed >= 20 && !achievementsUnlocked.value.has('speed20x')) {
    showAchievement({
      id: Date.now(),
      icon: '⚡',
      name: 'Lightspeed Mode - 20X Speed!'
    })
    achievementsUnlocked.value.add('speed20x')
    comboMultiplier.value = 2
    setTimeout(() => {
      comboMultiplier.value = 1
    }, 3000)
  } else if (speed >= 10 && !achievementsUnlocked.value.has('speed10x')) {
    showAchievement({
      id: Date.now(),
      icon: '💨',
      name: 'Turbo Mode - 10X Speed!'
    })
    achievementsUnlocked.value.add('speed10x')
  }
})

watch(() => props.raceCount, (count) => {
  if (count > 0 && count % 3 === 0 && !achievementsUnlocked.value.has(`streak${count}`)) {
    currentStreak.value = count
    showAchievement({
      id: Date.now(),
      icon: '🔥',
      name: `${count} Race Streak!`
    })
    achievementsUnlocked.value.add(`streak${count}`)
  }
})

function showAchievement(achievement: Achievement) {
  recentAchievements.value.push(achievement)
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    const index = recentAchievements.value.findIndex(a => a.id === achievement.id)
    if (index > -1) {
      recentAchievements.value.splice(index, 1)
    }
  }, 4000)
}

// Expose for parent component
defineExpose({
  showAchievement
})
</script>

<style scoped>
.achievement-enter-active {
  animation: slide-in 0.5s ease-out;
}

.achievement-leave-active {
  animation: slide-out 0.5s ease-in;
}

@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.achievement-popup {
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
