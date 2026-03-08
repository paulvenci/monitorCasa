<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-water-outline" class="mr-2" color="secondary"></v-icon>
      Estado del Agua
    </h2>

    <v-row density="compact">
      <v-col cols="12">
        <v-card class="pa-4 mb-4 text-center" border="opacity-10">
          <div class="tank-visual-large mx-auto mb-4">
            <div class="tank-body-large">
              <v-fade-transition mode="out-in">
                <div 
                  class="tank-fill-large" 
                  :key="nivelAgua"
                  :style="`height: ${nivelAgua}%`"
                ></div>
              </v-fade-transition>
              <div class="tank-label-large text-h3">{{ store.formatNumber(nivelAgua, 1) }}%</div>
            </div>
            <div class="mt-2 text-tiny text-muted" v-if="store.agua.actual?.created_at">
              Actualizado {{ store.timeSince(store.agua.actual?.created_at) }}
            </div>
          </div>
          <div class="text-h6 font-weight-bold">{{ store.formatNumber(litros, 0) }} Litros</div>
          <div class="text-caption text-muted">Tanque: {{ capacidad }}L | Calibración: {{ offset }}cm</div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="pa-4" border="opacity-10">
          <div class="text-overline text-muted mb-2">Estado del Sensor</div>
          <div class="d-flex align-center">
            <v-icon 
              :icon="batteryIcon" 
              :color="batteryColor" 
              size="large" 
              class="mr-3"
            ></v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ store.formatNumber(battery, 0) }}%</div>
              <div class="text-caption text-muted">Voltaje Batería: {{ store.formatNumber(voltBattery, 2) }}V</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()

// Datos reactivos
const nivelAgua = computed(() => store.agua.actual?.nivel_porcentaje || 0)
const litros = computed(() => {
  const cap = store.config.tanque_capacidad_litros || 1000
  return Math.round((nivelAgua.value / 100) * cap)
})
const battery = computed(() => store.agua.actual?.porcentaje_bateria || 0)
const voltBattery = computed(() => store.agua.actual?.voltaje_bateria || 0)
const capacidad = computed(() => store.config.tanque_capacidad_litros || 1000)
const offset = computed(() => store.config.jsn_sr04t_offset_cm || 0)

const batteryColor = computed(() => {
  if (battery.value > 50) return 'success'
  if (battery.value > 20) return 'warning'
  return 'error'
})

const batteryIcon = computed(() => {
  if (battery.value > 80) return 'mdi-battery'
  if (battery.value > 50) return 'mdi-battery-60'
  if (battery.value > 20) return 'mdi-battery-30'
  return 'mdi-battery-alert'
})

onMounted(() => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://vlccxzzbfuammgyxzogb.supabase.co'
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QM0Sst87rAe1Z1DdzJiVOg_pPKmmxEl'
  
  if (url && key) {
    store.initSupabase(url, key).then(() => {
      store.fetchAguaRealtime()
      store.setupRealtimeSubscriptions()
    })
  }
})
</script>

<style scoped>
.tank-visual-large {
  width: 150px;
  height: auto;
}

.tank-body-large {
  width: 100%;
  height: 250px;
  border: 4px solid #0984e3;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background: rgba(26, 26, 46, 0.8);
}

.tank-fill-large {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #00cec9 0%, #0984e3 100%);
  transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.tank-label-large {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 800;
  color: white;
  text-shadow: 0 4px 8px rgba(0,0,0,0.7);
  z-index: 2;
}

.text-muted {
  color: #b2bec3 !important;
}
</style>
