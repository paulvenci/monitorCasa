<template>
  <div class="energia-view pb-16">
    <div class="d-flex align-center mb-6">
      <h2 class="text-h4 font-weight-black title-gradient">Energía</h2>
    </div>

    <v-row density="compact">
      <v-col cols="12">
        <v-card class="premium-card pa-4 mb-2">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-overline font-weight-bold title-gradient">Energía Acumulada (Mes)</span>
            <v-icon icon="mdi-history" color="primary"></v-icon>
          </div>
          <div class="d-flex align-baseline">
            <span class="text-h3 font-weight-black text-white">{{ store.formatNumber(store.energiaMes, 2) }}</span>
            <span class="text-subtitle-1 ml-2 text-muted font-weight-medium">kWh (Mes)</span>
          </div>
          <div class="mt-4 mb-2">
             <div class="text-caption text-muted mb-2">Consumo Diario (Últimos 7 días)</div>
             <div class="chart-container" style="height: 150px;">
               <Bar v-if="barChartData.datasets[0].data.length" :data="barChartData" :options="barChartOptions" />
               <div v-else class="d-flex align-center justify-center h-100 text-muted text-caption">
                 Cargando historial diario...
               </div>
             </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="premium-card pa-4 mb-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-overline text-muted mb-1">Potencia Activa (Watts)</div>
              <div class="text-h6 font-weight-bold text-white">{{ store.formatNumber(potencia, 0) }} W</div>
            </div>
            <v-btn-toggle
              v-model="powerRange"
              mandatory
              density="compact"
              color="primary"
              variant="tonal"
              @update:model-value="updatePowerChart"
            >
              <v-btn value="hoy" size="small">Hoy</v-btn>
              <v-btn value="semana" size="small">Semana</v-btn>
              <v-btn value="mes" size="small">Mes</v-btn>
            </v-btn-toggle>
          </div>
          <div class="chart-container" style="height: 250px;">
            <Line v-if="chartData.datasets[0].data.length" :data="chartData" :options="chartOptions" />
            <div v-else class="d-flex align-center justify-center h-100 text-muted">
              Cargando historial de potencia...
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-row density="compact">
          <v-col cols="12">
            <metric-card
              label="Potencia Actual"
              :value="potencia"
              unit="Watts"
              icon="mdi-lightning-bolt"
              color="primary"
              :timestamp="store.energia.actual?.created_at"
              :decimals="0"
            />
          </v-col>
          <v-col cols="6">
            <metric-card
              label="Tensión"
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
              label="Corriente"
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
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../store/app.js'
import MetricCard from '../components/MetricCard.vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const store = useAppStore()
const powerRange = ref('hoy')

onMounted(() => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://vlccxzzbfuammgyxzogb.supabase.co'
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QM0Sst87rAe1Z1DdzJiVOg_pPKmmxEl'

  if (url && key) {
    store.initSupabase(url, key).then(() => {
      store.fetchEnergiaRealtime()
      store.fetchEnergiaHistorial()
      store.fetchEnergiaDiaria()
      store.fetchEnergiaPower('hoy')
      store.setupRealtimeSubscriptions()
    })
  }
})

const updatePowerChart = (val) => {
  store.fetchEnergiaPower(val)
}

const potencia = computed(() => store.energia.actual?.potencia || 0)
const voltaje = computed(() => store.energia.actual?.voltaje || 0)
const corriente = computed(() => store.energia.actual?.corriente || 0)

const chartData = computed(() => {
  const historial = store.energia.historialPower || []
  return {
    labels: historial.map(h => {
      const date = new Date(h.created_at)
      if (powerRange.value === 'hoy') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
    }),
    datasets: [{
      label: powerRange.value === 'hoy' ? 'Potencia (W)' : 'Potencia Máx (W)',
      data: historial.map(h => h.potencia),
      borderColor: '#00cec9',
      backgroundColor: 'rgba(0, 206, 201, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: powerRange.value === 'hoy' ? 0 : 3
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(22, 33, 62, 0.9)',
      titleColor: '#00cec9',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }
  },
  scales: {
    x: { display: false },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' }
    }
  }
}

const barChartData = computed(() => {
  const historial = store.energia.historialDiario || []
  return {
    labels: historial.map(h => {
       if (!h.fecha) return ''
       const [y, m, d] = h.fecha.split('-')
       return `${d}/${m}`
    }),
    datasets: [{
      label: 'Consumo Dia (kWh)',
      data: historial.map(h => h.kwh),
      backgroundColor: 'rgba(0, 206, 201, 0.5)',
      borderColor: '#00cec9',
      borderWidth: 1,
      borderRadius: 4
    }]
  }
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(22, 33, 62, 0.9)',
      titleColor: '#00cec9',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
          label: (context) => `${context.parsed.y.toFixed(2)} kWh`
      }
    }
  },
  scales: {
    x: { 
       grid: { display: false },
       ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', maxTicksLimit: 5, font: { size: 10 } }
    }
  }
}
</script>

<style scoped>
.title-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #00cec9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.premium-card {
  background: rgba(22, 33, 62, 0.45) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 20px !important;
}

.text-tiny {
  font-size: 0.65rem;
  letter-spacing: 0;
  text-transform: none;
}
</style>
