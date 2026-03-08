<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-water-outline" class="mr-2" color="secondary"></v-icon>
      Estado del Agua
    </h2>

    <v-row dense>
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
              <div class="tank-label-large text-h3">{{ nivelAgua }}%</div>
            </div>
          </div>
          <div class="text-h6 font-weight-bold">{{ litros }} Litros</div>
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
              <div class="text-h6 font-weight-bold">{{ battery }}%</div>
              <div class="text-caption text-muted">Voltaje Batería: {{ voltBattery }}V</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()

const nivelAgua = computed(() => store.agua.actual?.nivel_porcentaje || 0)
const capacidad = computed(() => store.agua.actual?.tanque_capacidad_litros || 1000)
const litros = computed(() => Math.round((nivelAgua.value / 100) * capacidad.value))
const offset = computed(() => store.agua.actual?.jsn_sr04t_offset_cm || 0)

const battery = computed(() => store.agua.actual?.porcentaje_bateria || 0)
const voltBattery = computed(() => (store.agua.actual?.voltaje_bateria || 0).toFixed(2))

const batteryColor = computed(() => {
  if (battery.value > 70) return 'success'
  if (battery.value > 30) return 'warning'
  return 'error'
})

const batteryIcon = computed(() => {
  if (battery.value > 90) return 'mdi-battery'
  if (battery.value > 10) return `mdi-battery-${Math.floor(battery.value / 10) * 10}`
  return 'mdi-battery-outline'
})
</script>

<style scoped>
.tank-visual-large {
  width: 150px;
  height: 250px;
}

.tank-body-large {
  width: 100%;
  height: 100%;
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
