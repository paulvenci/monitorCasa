<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-view-dashboard-outline" class="mr-2" color="primary"></v-icon>
      Resumen General
    </h2>

    <v-row dense>
      <!-- Energía -->
      <v-col cols="12" sm="6">
        <metric-card
          label="Potencia Actual"
          :value="potencia"
          unit="W"
          icon="mdi-flash"
          color="primary"
          :trend="5.2"
          trend-text="vs. ayer"
        />
      </v-col>
      
      <v-col cols="6" sm="3">
        <metric-card
          label="Voltaje"
          :value="voltaje"
          unit="V"
          icon="mdi-sine-wave"
          color="secondary"
        />
      </v-col>

      <v-col cols="6" sm="3">
        <metric-card
          label="Corriente"
          :value="corriente"
          unit="A"
          icon="mdi-current-ac"
          color="accent"
        />
      </v-col>

      <!-- Agua -->
      <v-col cols="12" sm="6">
        <v-card class="tank-card pa-4 d-flex flex-column align-center justify-center h-100">
          <div class="tank-wrapper mb-4">
            <div class="tank-body">
              <div class="tank-fill" :style="`height: ${nivelAgua}%`" :class="{ 'low': nivelAgua < 20 }"></div>
              <div class="tank-label">{{ nivelAgua }}%</div>
            </div>
          </div>
          <div class="text-center">
            <div class="text-overline font-weight-bold text-muted">Nivel de Agua</div>
            <div class="text-h6 font-weight-bold">{{ nivelLitros }} L</div>
          </div>
        </v-card>
      </v-col>

      <!-- Eventos Recientes -->
      <v-col cols="12" sm="6">
        <v-card class="h-100 pa-4" border="opacity-10">
          <div class="d-flex align-center justify-space-between mb-4">
            <span class="text-overline font-weight-bold text-muted">Avisos Recientes</span>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" to="/eventos"></v-btn>
          </div>
          
          <v-list density="compact" bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="evento in eventos"
              :key="evento.id"
              :prepend-icon="getEventIcon(evento.tipo)"
              :title="evento.titulo"
              :subtitle="formatDate(evento.created_at)"
              class="px-0 mb-1"
            >
              <template v-slot:subtitle="{ subtitle }">
                <span class="text-caption text-muted">{{ subtitle }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../store/app.js'
import MetricCard from '../components/MetricCard.vue'

const store = useAppStore()

// Datos reactivos desde el store
const potencia = computed(() => store.energia.actual?.potencia || 0)
const voltaje = computed(() => store.energia.actual?.voltaje || 0)
const corriente = computed(() => store.energia.actual?.corriente || 0)
const nivelAgua = computed(() => store.agua.actual?.nivel_porcentaje || 0)
const nivelLitros = computed(() => {
  const cap = store.agua.actual?.tanque_capacidad_litros || 1000
  return Math.round((nivelAgua.value / 100) * cap)
})

const eventos = computed(() => store.eventos)

const getEventIcon = (tipo) => {
  const icons = {
    'corte_luz': 'mdi-alert',
    'restauracion_luz': 'mdi-check-circle',
    'consumo_alto': 'mdi-trending-up',
    'nivel_bajo': 'mdi-water-alert',
    'nivel_critico': 'mdi-alarm-light',
    'bateria_baja': 'mdi-battery-alert'
  }
  return icons[tipo] || 'mdi-information'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  // Iniciar Supabase con variables de entorno (INYECTADAS POR GITHUB ACTIONS EN PROD)
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://vlccxzzbfuammgyxzogb.supabase.co'
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QM0Sst87rAe1Z1DdzJiVOg_pPKmmxEl'
  
  store.initSupabase(url, key)
  store.fetchEnergiaRealtime()
  store.fetchAguaRealtime()
  store.fetchEventos()
  store.setupRealtimeSubscriptions()
})
</script>

<style scoped>
.tank-card {
  background: rgba(22, 33, 62, 0.7) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.tank-wrapper {
  perspective: 1000px;
}

.tank-body {
  width: 80px;
  height: 120px;
  border: 3px solid #00cec9;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: rgba(26, 26, 46, 0.8);
}

.tank-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #00cec9 0%, #0984e3 100%);
  transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.tank-fill.low {
  background: linear-gradient(180deg, #fdcb6e 0%, #d63031 100%);
}

.tank-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  z-index: 2;
}

.text-muted {
  color: #b2bec3 !important;
}
</style>
