<template>
  <v-card class="metric-card overflow-hidden" elevation="0">
    <!-- Borde Neon Reactivo -->
    <div class="neon-border" :style="`background: linear-gradient(45deg, ${glowColor}, transparent 60%)`"></div>
    
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-overline font-weight-bold text-gradient">{{ label }}</span>
        <div class="d-flex flex-column align-end">
          <v-icon :icon="icon" :color="color" size="small" class="glow-icon mb-1"></v-icon>
          <span v-if="timestamp" class="text-tiny text-muted">{{ timeSinceLabel }}</span>
        </div>
      </div>
      
      <div class="d-flex align-baseline">
        <span class="text-h4 font-weight-black metric-value" :class="`text-${color}`">
          {{ formattedValue }}
        </span>
        <span class="text-subtitle-2 ml-1 text-muted font-weight-medium">{{ unit }}</span>
      </div>

      <div v-if="trend !== undefined" class="mt-3 d-flex align-center trend-pill px-2 py-1" :class="trendColor">
        <v-icon :icon="trendIcon" size="x-small" start></v-icon>
        <span class="text-caption font-weight-bold">{{ trendLabel }}</span>
      </div>
    </v-card-text>
    
    <!-- Efecto de iluminación interna -->
    <div class="inner-glow" :style="`background: radial-gradient(circle at center, ${glowColorInner} 0%, transparent 80%)`"></div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()

const props = defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  icon: String,
  timestamp: String,
  color: {
    type: String,
    default: 'primary'
  },
  trend: Number,
  trendText: String,
  decimals: {
    type: Number,
    default: 2
  }
})

const formattedValue = computed(() => store.formatNumber(props.value, props.decimals))
const timeSinceLabel = computed(() => store.timeSince(props.timestamp))

const trendColor = computed(() => (props.trend >= 0 ? 'success-trend' : 'error-trend'))
const trendIcon = computed(() => (props.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'))
const trendLabel = computed(() => `${Math.abs(props.trend)}% ${props.trendText}`)

const glowColor = computed(() => {
  const colors = {
    primary: '#00cec9',
    secondary: '#0984e3',
    accent: '#fab1a0',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#d63031'
  }
  return colors[props.color] || colors.primary
})

const glowColorInner = computed(() => `${glowColor.value}15`)
</script>

<style scoped>
.metric-card {
  position: relative;
  background: rgba(22, 33, 62, 0.45) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-tiny {
  font-size: 0.65rem;
  letter-spacing: 0;
  text-transform: lowercase;
}

.metric-card:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(22, 33, 62, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.neon-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  opacity: 0.8;
}

.inner-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.v-card-text {
  position: relative;
  z-index: 1;
}

.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #b2bec3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.metric-value {
  text-shadow: 0 0 20px currentColor;
}

.glow-icon {
  filter: drop-shadow(0 0 5px currentColor);
}

.trend-pill {
  border-radius: 8px;
  width: fit-content;
}

.success-trend {
  background: rgba(0, 184, 148, 0.1);
  color: #00b894;
}

.error-trend {
  background: rgba(214, 48, 49, 0.1);
  color: #d63031;
}

.text-muted {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
