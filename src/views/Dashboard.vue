<template>
  <div class="dashboard-view">
    <div class="d-flex align-center mb-6">
      <div class="header-glow"></div>
      <h2 class="text-h4 font-weight-black d-flex align-center title-gradient">
        <v-icon icon="mdi-view-dashboard-variant-outline" class="mr-3" color="primary"></v-icon>
        Dashboard
      </h2>
    </div>

    <v-row density="compact">
      <!-- Fila 1: Métricas Principales -->
      <v-col cols="12" sm="8">
        <v-row density="compact">
          <!-- Resumen Mensual (Costo y kWh) -->
          <v-col cols="12">
            <v-card class="premium-card pa-4 mb-2">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-overline font-weight-bold title-gradient">Resumen Mensual</span>
                <v-icon icon="mdi-calendar-month" color="primary"></v-icon>
              </div>
              <v-row>
                <v-col cols="6" class="border-right-glow">
                  <div class="text-caption text-muted mb-1">Costo Proyectado</div>
                  <div class="text-h4 font-weight-black text-white">
                    <span class="text-h6 text-muted mr-1">$</span>{{ store.formatNumber(store.costoProyectado, 0) }}
                  </div>
                  <div class="text-tiny text-muted mt-1" v-if="store.config?.tarifa_activa">
                    Tarifa {{ store.config?.tarifa_activa }}
                  </div>
                </v-col>
                <v-col cols="6" class="pl-4">
                  <div class="text-caption text-muted mb-1">Energía Acumulada</div>
                  <div class="text-h4 font-weight-black text-primary">
                    {{ store.formatNumber(store.energiaMes, 2) }}
                    <span class="text-subtitle-1 text-muted">kWh</span>
                  </div>
                  <div class="text-tiny text-muted mt-1" v-if="store.energia.actual?.created_at">
                    {{ store.timeSince(store.energia.actual?.created_at) }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12">
            <metric-card
              label="Consumo en Tiempo Real"
              :value="potencia"
              unit="Watts"
              icon="mdi-lightning-bolt"
              color="primary"
              :trend="5.2"
              trend-text="vs. promedio"
              :timestamp="store.energia.actual?.created_at"
              :decimals="0"
            />
          </v-col>
          
          <v-col cols="6">
            <metric-card
              label="Tensión Red"
              :value="voltaje"
              unit="V"
              icon="mdi-sine-wave"
              color="secondary"
              :timestamp="store.energia.actual?.created_at"
              :decimals="1"
            />
          </v-col>

          <v-col cols="6">
            <metric-card
              label="Intensidad"
              :value="corriente"
              unit="Amp"
              icon="mdi-current-ac"
              color="accent"
              :timestamp="store.energia.actual?.created_at"
              :decimals="2"
            />
          </v-col>
        </v-row>
      </v-col>

      <!-- Fila 1 Col 2: Tanque de Agua -->
      <v-col cols="12" sm="4">
        <v-card class="premium-card tank-card h-100 pa-4 d-flex flex-column align-center justify-center">
          <div class="tank-visualization">
            <div class="tank-glass">
              <div class="liquid" :style="`height: ${nivelAgua}%`" :class="{ 'warning-liquid': nivelAgua < 20 }">
                <div class="wave"></div>
                <div class="wave"></div>
              </div>
              <div class="tank-glare"></div>
            </div>
            <div class="percentage-display">
              <span class="val">{{ store.formatNumber(nivelAgua, 1) }}</span>
              <span class="pct">%</span>
            </div>
            <div class="tank-time-badge" v-if="store.agua.actual?.created_at">
              {{ store.timeSince(store.agua.actual?.created_at) }}
            </div>
          </div>
          <div class="mt-6 text-center">
            <div class="text-overline font-weight-black text-primary-light">Reserva de Agua</div>
            <div class="text-h4 font-weight-black">{{ store.formatNumber(nivelLitros, 0) }}<span class="text-subtitle-1 ml-1 text-muted">L</span></div>
          </div>
        </v-card>
      </v-col>

      <!-- Fila 2: Alertas y Gráfico (Simplificado para el preview actual) -->
      <v-col cols="12">
        <v-card class="premium-card pa-4 mt-2">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-bell-ring-outline" color="warning" class="mr-2"></v-icon>
              <span class="text-overline font-weight-black">Alertas del Sistema</span>
            </div>
            <v-btn variant="text" color="primary" size="small" to="/eventos">Ver todo</v-btn>
          </div>
          
          <v-list bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="evento in eventos"
              :key="evento.id"
              class="event-item mb-2 rounded-lg"
              :prepend-icon="getEventIcon(evento.tipo)"
            >
              <v-list-item-title class="font-weight-bold">{{ evento.titulo }}</v-list-item-title>
              <v-list-item-subtitle class="text-muted">{{ formatDate(evento.created_at) }}</v-list-item-subtitle>
              
              <template v-slot:prepend>
                <v-icon :color="getEventColor(evento.tipo)" size="small" class="mr-4"></v-icon>
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

const potencia = computed(() => store.energia.actual?.potencia || 0)
const voltaje = computed(() => store.energia.actual?.voltaje || 220)
const corriente = computed(() => store.energia.actual?.corriente || 0)
const nivelAgua = computed(() => store.agua.actual?.nivel_porcentaje || 0)
const nivelLitros = computed(() => {
  const cap = store.config.tanque_capacidad_litros || 1000
  return Math.round((nivelAgua.value / 100) * cap)
})

const eventos = computed(() => store.eventos.slice(0, 3))

const getEventIcon = (tipo) => {
  const icons = {
    'corte_luz': 'mdi-flash-off',
    'restauracion_luz': 'mdi-flash-check',
    'consumo_alto': 'mdi-trending-up',
    'nivel_bajo': 'mdi-water-alert',
    'nivel_critico': 'mdi-alert-octagon',
    'bateria_baja': 'mdi-battery-alert'
  }
  return icons[tipo] || 'mdi-information-outline'
}

const getEventColor = (tipo) => {
  if (tipo.includes('critico') || tipo.includes('corte')) return 'error'
  if (tipo.includes('bajo') || tipo.includes('alto')) return 'warning'
  return 'success'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
    Math.round((date - new Date()) / 60000), 
    'minute'
  )
}

onMounted(() => {
  // Usar variables de entorno con fallbacks para desarrollo local
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://vlccxzzbfuammgyxzogb.supabase.co'
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QM0Sst87rAe1Z1DdzJiVOg_pPKmmxEl'
  
  if (url && key) {
    store.initSupabase(url, key).then(() => {
      store.fetchEnergiaRealtime()
      store.fetchAguaRealtime()
      store.fetchEventos()
      store.setupRealtimeSubscriptions()
    })
  }
})
</script>

<style scoped>
.title-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #00cec9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1.5px;
}

.premium-card {
  background: rgba(22, 33, 62, 0.4) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
}

.border-right-glow {
  position: relative;
}

.border-right-glow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(0, 206, 201, 0.5), transparent);
}

/* Visualización del Tanque Avanzada */
.tank-visualization {
  position: relative;
  width: 140px;
  height: 200px;
}

.tank-glass {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(0, 206, 201, 0.4);
  background: rgba(4, 4, 10, 0.6);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 206, 201, 0.1) inset;
}

.liquid {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(180deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%);
  transition: height 2s ease-in-out;
  box-shadow: 0 0 30px rgba(0, 206, 201, 0.5);
}

.warning-liquid {
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 0 30px rgba(245, 87, 108, 0.5);
}

.percentage-display {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.percentage-display .val {
  font-size: 3rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);
}

.percentage-display .pct {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
}

.tank-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, transparent 50%);
  pointer-events: none;
}

.tank-time-badge {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 10;
  backdrop-filter: blur(4px);
  white-space: nowrap;
}

.event-item {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  transform: translateX(4px);
}

.text-primary-light {
  color: #00cec9;
  letter-spacing: 2px;
}

.text-muted {
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>
