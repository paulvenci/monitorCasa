<template>
  <v-card class="metric-card overflow-hidden">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-overline font-weight-bold text-muted">{{ label }}</span>
        <v-icon :icon="icon" :color="color" size="small"></v-icon>
      </div>
      
      <div class="d-flex align-baseline">
        <span class="text-h4 font-weight-bold" :class="`text-${color}`">
          {{ value }}
        </span>
        <span class="text-caption ml-1 text-muted">{{ unit }}</span>
      </div>

      <div v-if="trend" class="mt-2 d-flex align-center">
        <v-icon :icon="trendIcon" :color="trendColor" size="x-small" start></v-icon>
        <span :class="`text-caption text-${trendColor}`">{{ trendLabel }}</span>
      </div>
    </v-card-text>
    
    <!-- Efecto de brillo de fondo -->
    <div class="card-glow" :style="`background: radial-gradient(circle at top right, ${glowColor} 0%, transparent 70%)`"></div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  icon: String,
  color: {
    type: String,
    default: 'primary'
  },
  trend: Number,
  trendText: String
})

const trendColor = computed(() => (props.trend >= 0 ? 'success' : 'error'))
const trendIcon = computed(() => (props.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'))
const trendLabel = computed(() => `${props.trend}% ${props.trendText}`)
const glowColor = computed(() => {
  const colors = {
    primary: 'rgba(0, 206, 201, 0.15)',
    secondary: 'rgba(9, 132, 227, 0.15)',
    success: 'rgba(0, 184, 148, 0.15)',
    warning: 'rgba(253, 203, 110, 0.15)',
    error: 'rgba(214, 48, 49, 0.15)'
  }
  return colors[props.color] || colors.primary
})
</script>

<style scoped>
.metric-card {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  background: rgba(22, 33, 62, 0.7) !important;
  backdrop-filter: blur(10px);
}

.text-muted {
  color: #b2bec3 !important;
}

.card-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.v-card-text {
  position: relative;
  z-index: 1;
}
</style>
