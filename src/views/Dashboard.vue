<template>
  <div class="dashboard-view pb-16">
    <div class="d-flex align-center mb-6">
      <div class="header-glow"></div>
      <h2 class="text-h4 font-weight-black d-flex align-center title-gradient">
        <v-icon icon="mdi-view-dashboard-variant-outline" class="mr-3" color="primary"></v-icon>
        Dashboard
      </h2>
    </div>

    <v-row density="compact">
      <v-col cols="12">
        <v-card class="premium-card pa-4 mb-3 overview-card">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="text-overline font-weight-bold title-gradient">Resumen de tu cuenta electrica</div>
              <div class="text-caption text-muted">
                {{ store.billingProfile.distribuidora }} | {{ store.billingProfile.comuna }}, {{ store.billingProfile.region }}
              </div>
            </div>
            <v-btn to="/energia" variant="tonal" color="primary" size="small">
              Ver detalle
            </v-btn>
          </div>

          <v-row density="compact">
            <v-col cols="12" md="4">
              <div class="summary-block summary-block--bill">
                <div class="summary-label">Factura referencial</div>
                <div class="summary-value">$ {{ store.formatNumber(invoiceReference.total, 0) }}</div>
                <div class="summary-caption">{{ store.formatNumber(invoiceReference.kwh, 2) }} kWh</div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="summary-block summary-block--monitor">
                <div class="summary-label">Electrosun</div>
                <div class="summary-value">$ {{ store.formatNumber(monitorEstimate.total, 0) }}</div>
                <div class="summary-caption">{{ store.formatNumber(monitorEstimate.kwh, 2) }} kWh medidos</div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="summary-block summary-block--delta">
                <div class="summary-label">Diferencia</div>
                <div class="summary-value">{{ signedCurrency(differenceTotal) }}</div>
                <div class="summary-caption">{{ signedPercent(differencePercent) }} del total referencial</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card class="premium-card pa-4 mb-3 h-100">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-overline font-weight-bold title-gradient">Consumo y cobro del periodo</div>
              <div class="text-caption text-muted">Base para conciliar la boleta con el monitoreo</div>
            </div>
          </div>

          <v-row density="compact">
            <v-col cols="12" sm="6">
              <div class="metric-box">
                <div class="metric-label">Energia acumulada</div>
                <div class="metric-value">{{ store.formatNumber(store.energiaMes, 2) }} <span class="unit">kWh</span></div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="metric-box">
                <div class="metric-label">Costo estimado Electrosun</div>
                <div class="metric-value">$ {{ store.formatNumber(monitorEstimate.total, 0) }}</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="metric-box">
                <div class="metric-label">Tension red</div>
                <div class="metric-value">{{ store.formatNumber(voltaje, 1) }} <span class="unit">V</span></div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="metric-box">
                <div class="metric-label">Intensidad</div>
                <div class="metric-value">{{ store.formatNumber(corriente, 2) }} <span class="unit">Amp</span></div>
              </div>
            </v-col>
          </v-row>

          <div class="highlight-note mt-4">
            La referencia se calcula con el perfil de facturacion configurado, incluyendo distribuidora, ubicacion y ajustes porcentuales del ciclo.
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="premium-card tank-card h-100 pa-4 d-flex flex-column">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-overline font-weight-black text-primary-light">Reserva de Agua</div>
              <div class="text-caption text-muted">{{ store.timeSince(store.agua.actual?.created_at) || 'sin lectura reciente' }}</div>
            </div>
          </div>

          <div class="tank-visualization mx-auto">
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
          </div>

          <div class="mt-4">
            <v-row density="compact">
              <v-col cols="6">
                <div class="water-pill">{{ store.formatNumber(nivelLitros, 0) }} L</div>
              </v-col>
              <v-col cols="6">
                <div class="water-pill">{{ store.formatNumber(bateria, 0) }}% / {{ store.formatNumber(voltBattery, 2) }}V</div>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="premium-card pa-4 mt-2">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-bell-ring-outline" color="warning" class="mr-2"></v-icon>
              <span class="text-overline font-weight-black">Alertas del sistema</span>
            </div>
            <v-btn variant="text" color="primary" size="small" to="/eventos">Ver todo</v-btn>
          </div>

          <v-list bg-color="transparent" class="pa-0">
            <v-list-item
              v-for="evento in eventos"
              :key="evento.id"
              class="event-item mb-2 rounded-lg"
            >
              <v-list-item-title class="font-weight-bold">{{ evento.titulo }}</v-list-item-title>
              <v-list-item-subtitle class="text-muted">{{ formatDate(evento.created_at) }}</v-list-item-subtitle>

              <template v-slot:prepend>
                <v-icon :icon="getEventIcon(evento.tipo)" :color="getEventColor(evento.tipo)" size="small" class="mr-4"></v-icon>
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

const store = useAppStore()

const voltaje = computed(() => store.energia.actual?.voltaje || 220)
const corriente = computed(() => store.energia.actual?.corriente || 0)
const nivelAgua = computed(() => store.agua.actual?.nivel_porcentaje || 0)
const bateria = computed(() => store.agua.actual?.porcentaje_bateria || 0)
const voltBattery = computed(() => store.agua.actual?.voltaje_bateria || 0)
const nivelLitros = computed(() => {
  const cap = store.config.tanque_capacidad_litros || 1000
  return Math.round((nivelAgua.value / 100) * cap)
})

const eventos = computed(() => store.eventos.slice(0, 3))

const monitorEstimate = computed(() => store.monitorEstimate)
const invoiceReference = computed(() => store.invoiceReference)

const differenceTotal = computed(() => invoiceReference.value.total - monitorEstimate.value.total)
const differencePercent = computed(() => {
  if (!invoiceReference.value.total) return 0
  return (differenceTotal.value / invoiceReference.value.total) * 100
})

const signedCurrency = (value) => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}$ ${store.formatNumber(Math.abs(value), 0)}`
}

const signedPercent = (value) => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${store.formatNumber(Math.abs(value), 1)}%`
}

const getEventIcon = (tipo) => {
  const icons = {
    corte_luz: 'mdi-flash-off',
    restauracion_luz: 'mdi-flash-check',
    consumo_alto: 'mdi-trending-up',
    nivel_bajo: 'mdi-water-alert',
    nivel_critico: 'mdi-alert-octagon',
    bateria_baja: 'mdi-battery-alert'
  }
  return icons[tipo] || 'mdi-information-outline'
}

const getEventColor = (tipo = '') => {
  if (tipo.includes('critico') || tipo.includes('corte')) return 'error'
  if (tipo.includes('bajo') || tipo.includes('alto')) return 'warning'
  return 'success'
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
    Math.round((date - new Date()) / 60000),
    'minute'
  )
}

onMounted(() => {
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

.overview-card {
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  inset: auto -10% -45% 50%;
  height: 260px;
  background: radial-gradient(circle, rgba(0, 206, 201, 0.16), transparent 70%);
  pointer-events: none;
}

.summary-block {
  position: relative;
  z-index: 1;
  height: 100%;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-block--bill {
  background: rgba(255, 255, 255, 0.05);
}

.summary-block--monitor {
  background: rgba(0, 206, 201, 0.12);
}

.summary-block--delta {
  background: rgba(9, 132, 227, 0.16);
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.summary-value {
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  font-weight: 900;
  color: #fff;
}

.summary-caption {
  margin-top: 6px;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.62);
}

.metric-box {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  height: 100%;
}

.metric-label {
  font-size: 0.72rem;
  letter-spacing: 0.4px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.metric-value {
  font-weight: 800;
  color: #ffffff;
  font-size: 1.15rem;
}

.unit {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.62);
}

.highlight-note {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
}

.tank-card {
  min-height: 100%;
}

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

.water-pill {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.04);
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
