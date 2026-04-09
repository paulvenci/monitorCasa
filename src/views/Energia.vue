<template>
  <div class="energia-view pb-16">
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <h2 class="text-h4 font-weight-black title-gradient mb-1">Energia</h2>
        <div class="text-caption text-muted">
          Lectura del periodo con comparacion entre factura referencial y monitoreo Electrosun
        </div>
      </div>

      <v-chip
        size="small"
        variant="tonal"
        color="primary"
        class="period-chip"
      >
        Periodo {{ billingPeriodLabel }}
      </v-chip>
    </div>

    <v-row density="compact">
      <v-col cols="12">
        <v-card class="premium-card pa-4 mb-3 hero-card">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="text-overline text-muted mb-1">Resumen del periodo facturado</div>
              <div class="text-h5 font-weight-black text-white">
                {{ billingPeriodLabel }}
              </div>
              <div class="text-caption text-muted mt-1">
                {{ store.billingProfile.distribuidora }} | {{ store.billingProfile.comuna }}, {{ store.billingProfile.region }}
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip size="small" color="primary" variant="flat">Monitoreo activo</v-chip>
              <v-chip size="small" :color="differenceTone.color" variant="tonal">
                {{ differenceTone.label }}
              </v-chip>
            </div>
          </div>

          <v-row density="compact">
            <v-col cols="12" md="4">
              <div class="comparison-card comparison-card--bill">
                <div class="comparison-label">Factura referencial</div>
                <div class="comparison-amount">$ {{ store.formatNumber(invoiceReference.total, 0) }}</div>
                <div class="comparison-subtext">
                  {{ store.formatNumber(invoiceReference.kwh, 2) }} kWh cobrados
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="comparison-card comparison-card--monitor">
                <div class="comparison-label">Electrosun monitoreo</div>
                <div class="comparison-amount">$ {{ store.formatNumber(monitorEstimate.total, 0) }}</div>
                <div class="comparison-subtext">
                  {{ store.formatNumber(monitorEstimate.kwh, 2) }} kWh medidos
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="comparison-card comparison-card--delta">
                <div class="comparison-label">Diferencia</div>
                <div class="comparison-amount">{{ currencySigned(differenceTotal) }}</div>
                <div class="comparison-subtext">
                  {{ signedPercent(differencePercent) }} frente a la factura
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-tabs v-model="activeTab" bg-color="transparent" color="primary" class="mb-3 energy-tabs">
          <v-tab value="boleta">Boleta</v-tab>
          <v-tab value="comparacion">Comparacion</v-tab>
          <v-tab value="consumo">Consumo diario</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="boleta">
            <v-row density="compact">
              <v-col cols="12" lg="7">
                <v-card class="premium-card pa-4 h-100">
                  <div class="section-header mb-4">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Lectura tipo boleta</div>
                      <div class="text-caption text-muted">Comparacion por conceptos de cobro</div>
                    </div>
                  </div>

                  <div class="bill-grid bill-grid--head mb-2">
                    <div class="bill-grid__concept">Concepto</div>
                    <div class="bill-grid__value">Factura</div>
                    <div class="bill-grid__value">Electrosun</div>
                    <div class="bill-grid__value">Diferencia</div>
                  </div>

                  <div
                    v-for="row in comparisonRows"
                    :key="row.key"
                    class="bill-grid bill-row"
                  >
                    <div class="bill-grid__concept">
                      <div class="font-weight-bold text-white">{{ row.label }}</div>
                      <div class="text-caption text-muted" v-if="row.helper">{{ row.helper }}</div>
                    </div>
                    <div class="bill-grid__value">{{ money(row.invoice) }}</div>
                    <div class="bill-grid__value">{{ money(row.monitor) }}</div>
                    <div class="bill-grid__value" :class="row.delta >= 0 ? 'text-warning' : 'text-success'">
                      {{ currencySigned(row.delta) }}
                    </div>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" lg="5">
                <v-card class="premium-card pa-4 mb-3">
                  <div class="section-header mb-3">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Datos del periodo</div>
                      <div class="text-caption text-muted">Pensado como resumen de cuenta</div>
                    </div>
                  </div>

                  <div class="detail-list">
                    <div class="detail-item">
                      <span class="text-muted">Distribuidora</span>
                      <strong>{{ store.billingProfile.distribuidora }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Ubicacion</span>
                      <strong>{{ store.billingProfile.comuna }}, {{ store.billingProfile.region }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Desde</span>
                      <strong>{{ periodStartLabel }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Hasta</span>
                      <strong>{{ periodEndLabel }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Dias facturados</span>
                      <strong>{{ billingDays }} dias</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Tarifa activa</span>
                      <strong class="text-capitalize">{{ store.config?.tarifa_activa || 'sin definir' }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Factor ajuste kWh</span>
                      <strong>x {{ store.formatNumber(store.billingProfile.factor_ajuste_kwh, 3) }}</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Lectura estimada anterior</span>
                      <strong>{{ store.formatNumber(previousReadingEstimate, 2) }} kWh</strong>
                    </div>
                    <div class="detail-item">
                      <span class="text-muted">Lectura estimada actual</span>
                      <strong>{{ store.formatNumber(currentReadingEstimate, 2) }} kWh</strong>
                    </div>
                  </div>
                </v-card>

                <v-card class="premium-card pa-4">
                  <div class="section-header mb-3">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Interpretacion</div>
                      <div class="text-caption text-muted">Que le dirias al usuario final</div>
                    </div>
                  </div>

                  <div class="insight-list">
                    <div class="insight-item">
                      Electrosun estima un total de <strong>{{ money(monitorEstimate.total) }}</strong> para este ciclo.
                    </div>
                    <div class="insight-item">
                      La factura referencial se ubica en <strong>{{ money(invoiceReference.total) }}</strong>, con una brecha de <strong>{{ currencySigned(differenceTotal) }}</strong>.
                    </div>
                    <div class="insight-item">
                      La referencia usa los parametros de {{ store.billingProfile.distribuidora }} en {{ store.billingProfile.comuna }} y un ajuste de consumo configurable para anticipar lo que podria venir en la boleta.
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="comparacion">
            <v-row density="compact">
              <v-col cols="12" lg="5">
                <v-card class="premium-card pa-4 h-100">
                  <div class="section-header mb-4">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Indicadores de conciliacion</div>
                      <div class="text-caption text-muted">Lo que la compania cobra versus lo que mides</div>
                    </div>
                  </div>

                  <v-row density="compact">
                    <v-col cols="12">
                      <div class="metric-highlight">
                        <div class="metric-highlight__label">Desviacion monetaria</div>
                        <div class="metric-highlight__value">{{ currencySigned(differenceTotal) }}</div>
                        <div class="metric-highlight__sub">{{ signedPercent(differencePercent) }} del total facturado</div>
                      </div>
                    </v-col>

                    <v-col cols="6">
                      <div class="mini-stat">
                        <div class="mini-stat__label">kWh boleta</div>
                        <div class="mini-stat__value">{{ store.formatNumber(invoiceReference.kwh, 2) }}</div>
                      </div>
                    </v-col>

                    <v-col cols="6">
                      <div class="mini-stat">
                        <div class="mini-stat__label">kWh medidos</div>
                        <div class="mini-stat__value">{{ store.formatNumber(monitorEstimate.kwh, 2) }}</div>
                      </div>
                    </v-col>

                    <v-col cols="6">
                      <div class="mini-stat">
                        <div class="mini-stat__label">Cargo fijo</div>
                        <div class="mini-stat__value">{{ money(store.config?.cargo_fijo || 0) }}</div>
                      </div>
                    </v-col>

                    <v-col cols="6">
                      <div class="mini-stat">
                        <div class="mini-stat__label">Transmision</div>
                        <div class="mini-stat__value">{{ money(monitorEstimate.transmission) }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>

              <v-col cols="12" lg="7">
                <v-card class="premium-card pa-4">
                  <div class="section-header mb-4">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Factura vs monitoreo</div>
                      <div class="text-caption text-muted">Comparacion directa de cobro y consumo</div>
                    </div>
                  </div>

                  <div class="chart-container comparison-chart">
                    <Bar :data="comparisonChartData" :options="comparisonChartOptions" />
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="consumo">
            <v-row density="compact">
              <v-col cols="12" lg="7">
                <v-card class="premium-card pa-4 mb-3">
                  <div class="section-header mb-4">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Consumo diario del ciclo</div>
                      <div class="text-caption text-muted">Ideal para revisar si la boleta cierra con tus datos</div>
                    </div>
                  </div>
                  <div class="chart-container daily-chart">
                    <Bar :data="barChartData" :options="barChartOptions" />
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" lg="5">
                <v-card class="premium-card pa-4 mb-3">
                  <div class="section-header mb-4">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Potencia y demanda</div>
                      <div class="text-caption text-muted">Contexto para entender dias o tramos caros</div>
                    </div>
                  </div>

                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      <div class="text-caption text-muted">Potencia activa actual</div>
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

                  <div class="chart-container power-chart">
                    <Line :data="chartData" :options="chartOptions" />
                  </div>
                </v-card>

                <v-card class="premium-card pa-4">
                  <div class="section-header mb-3">
                    <div>
                      <div class="text-overline font-weight-bold title-gradient">Hallazgos del periodo</div>
                    </div>
                  </div>

                  <div class="insight-list">
                    <div class="insight-item">
                      El promedio diario del ciclo es <strong>{{ store.formatNumber(averageDailyKwh, 2) }} kWh</strong>.
                    </div>
                    <div class="insight-item">
                      El dia mas alto registrado marca <strong>{{ store.formatNumber(peakDay.kwh, 2) }} kWh</strong>{{ peakDay.label ? ` el ${peakDay.label}` : '' }}.
                    </div>
                    <div class="insight-item">
                      Si la factura real difiere demasiado, conviene guardar lectura de medidor al inicio y fin del ciclo.
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../store/app.js'
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
const activeTab = ref('boleta')

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

const billingPeriodEnd = computed(() => store.billingPeriodRange.end)
const billingPeriodStart = computed(() => store.billingPeriodRange.start)
const billingDays = computed(() => store.billingDays)

const periodFormatter = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short'
})

const periodStartLabel = computed(() => periodFormatter.format(billingPeriodStart.value))
const periodEndLabel = computed(() => periodFormatter.format(billingPeriodEnd.value))
const billingPeriodLabel = computed(() => `${periodStartLabel.value} - ${periodEndLabel.value}`)

const measuredKwh = computed(() => Number(store.energiaMes || 0))
const monitorEstimate = computed(() => store.monitorEstimate)
const invoiceReference = computed(() => store.invoiceReference)

const differenceTotal = computed(() => invoiceReference.value.total - monitorEstimate.value.total)
const differencePercent = computed(() => {
  if (!invoiceReference.value.total) return 0
  return (differenceTotal.value / invoiceReference.value.total) * 100
})

const differenceTone = computed(() => {
  const abs = Math.abs(differencePercent.value)
  if (abs < 3) return { color: 'success', label: 'Diferencia menor' }
  if (abs < 8) return { color: 'warning', label: 'Revisar diferencia' }
  return { color: 'error', label: 'Brecha alta' }
})

const previousReadingEstimate = computed(() => Math.max(0, measuredKwh.value - averageDailyKwh.value * billingDays.value))
const currentReadingEstimate = computed(() => previousReadingEstimate.value + measuredKwh.value)

const comparisonRows = computed(() => {
  const monitorTaxes = monitorEstimate.value.taxes
  const rows = [
    {
      key: 'energia',
      label: 'Energia consumida',
      helper: `${store.formatNumber(invoiceReference.value.kwh, 2)} kWh vs ${store.formatNumber(monitorEstimate.value.kwh, 2)} kWh`,
      invoice: invoiceReference.value.energyCharge,
      monitor: monitorEstimate.value.energyCharge
    },
    {
      key: 'cargo_fijo',
      label: 'Cargo fijo',
      helper: 'Cargo base del suministro',
      invoice: invoiceReference.value.fixedCharge,
      monitor: monitorEstimate.value.fixedCharge
    },
    {
      key: 'transmision',
      label: 'Transmision y peajes',
      helper: 'Aplicado sobre el consumo del ciclo',
      invoice: invoiceReference.value.transmission,
      monitor: monitorEstimate.value.transmission
    },
    {
      key: 'impuestos',
      label: 'Impuestos y ajustes',
      helper: 'Referencia hasta contar con boleta real',
      invoice: invoiceReference.value.taxes + invoiceReference.value.otherCharges,
      monitor: monitorTaxes
    },
    {
      key: 'total',
      label: 'Total del periodo',
      helper: 'Monto final del ciclo',
      invoice: invoiceReference.value.total,
      monitor: monitorEstimate.value.total
    }
  ]

  return rows.map((row) => ({
    ...row,
    delta: row.invoice - row.monitor
  }))
})

const money = (value) => `$ ${store.formatNumber(value, 0)}`
const currencySigned = (value) => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}$ ${store.formatNumber(Math.abs(value), 0)}`
}
const signedPercent = (value) => {
  const sign = value >= 0 ? '+' : '-'
  return `${sign}${store.formatNumber(Math.abs(value), 1)}%`
}

const chartData = computed(() => {
  const historial = store.energia.historialPower || []
  return {
    labels: historial.map((h) => {
      const date = new Date(h.created_at)
      if (powerRange.value === 'hoy') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
    }),
    datasets: [{
      label: powerRange.value === 'hoy' ? 'Potencia (W)' : 'Potencia max (W)',
      data: historial.map((h) => h.potencia),
      borderColor: '#00cec9',
      backgroundColor: 'rgba(0, 206, 201, 0.10)',
      fill: true,
      tension: 0.35,
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
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', maxTicksLimit: 6 }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' }
    }
  }
}

const barChartData = computed(() => {
  const historial = store.energia.historialDiario || []
  return {
    labels: historial.map((h) => {
      if (!h.fecha) return ''
      const [year, month, day] = h.fecha.split('-')
      return `${day}/${month}`
    }),
    datasets: [{
      label: 'Consumo diario (kWh)',
      data: historial.map((h) => h.kwh),
      backgroundColor: 'rgba(0, 206, 201, 0.45)',
      borderColor: '#00cec9',
      borderWidth: 1,
      borderRadius: 6
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

const comparisonChartData = computed(() => ({
  labels: ['kWh', 'Costo energia', 'Transmision', 'Total'],
  datasets: [
    {
      label: 'Factura',
      data: [
        invoiceReference.value.kwh,
        invoiceReference.value.energyCharge,
        invoiceReference.value.transmission,
        invoiceReference.value.total
      ],
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      borderColor: 'rgba(255, 255, 255, 0.55)',
      borderWidth: 1,
      borderRadius: 8
    },
    {
      label: 'Electrosun',
      data: [
        monitorEstimate.value.kwh,
        monitorEstimate.value.energyCharge,
        monitorEstimate.value.transmission,
        monitorEstimate.value.total
      ],
      backgroundColor: 'rgba(0, 206, 201, 0.45)',
      borderColor: '#00cec9',
      borderWidth: 1,
      borderRadius: 8
    }
  ]
}))

const comparisonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: 'rgba(255, 255, 255, 0.7)' }
    },
    tooltip: {
      backgroundColor: 'rgba(22, 33, 62, 0.9)',
      titleColor: '#00cec9',
      bodyColor: '#fff'
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255, 255, 255, 0.55)' }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' }
    }
  }
}

const averageDailyKwh = computed(() => {
  const values = (store.energia.historialDiario || []).map((item) => Number(item.kwh || 0)).filter((value) => value > 0)
  if (!values.length) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
})

const peakDay = computed(() => {
  const values = store.energia.historialDiario || []
  if (!values.length) return { kwh: 0, label: '' }

  const peak = values.reduce((highest, item) => (Number(item.kwh || 0) > Number(highest.kwh || 0) ? item : highest), values[0])
  if (!peak?.fecha) return { kwh: Number(peak?.kwh || 0), label: '' }

  const [year, month, day] = peak.fecha.split('-')
  return {
    kwh: Number(peak.kwh || 0),
    label: `${day}/${month}`
  }
})
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

.hero-card {
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: auto -20% -40% 45%;
  height: 220px;
  background: radial-gradient(circle, rgba(0, 206, 201, 0.18), transparent 70%);
  pointer-events: none;
}

.period-chip {
  border: 1px solid rgba(0, 206, 201, 0.25);
}

.comparison-card {
  height: 100%;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.comparison-card--bill {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
}

.comparison-card--monitor {
  background: linear-gradient(180deg, rgba(0, 206, 201, 0.18), rgba(0, 206, 201, 0.05));
}

.comparison-card--delta {
  background: linear-gradient(180deg, rgba(9, 132, 227, 0.20), rgba(9, 132, 227, 0.06));
}

.comparison-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 8px;
}

.comparison-amount {
  font-size: clamp(1.4rem, 2vw, 2rem);
  font-weight: 900;
  color: #fff;
}

.comparison-subtext {
  margin-top: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.energy-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0.2px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bill-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(3, minmax(80px, 1fr));
  gap: 12px;
  align-items: center;
}

.bill-grid--head {
  padding: 0 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: rgba(255, 255, 255, 0.45);
}

.bill-row {
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.bill-row:last-child {
  border-bottom: 0;
}

.bill-grid__value {
  text-align: right;
  color: rgba(255, 255, 255, 0.86);
  font-weight: 600;
}

.detail-list,
.insight-list {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.detail-item:last-child {
  border-bottom: 0;
}

.insight-item {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.45;
}

.metric-highlight {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(0, 206, 201, 0.16), rgba(0, 206, 201, 0.04));
  border: 1px solid rgba(0, 206, 201, 0.18);
}

.metric-highlight__label,
.mini-stat__label {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: rgba(255, 255, 255, 0.55);
}

.metric-highlight__value {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 900;
  color: #fff;
  margin-top: 8px;
}

.metric-highlight__sub {
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.62);
}

.mini-stat {
  height: 100%;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mini-stat__value {
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  margin-top: 8px;
}

.chart-container {
  position: relative;
  width: 100%;
}

.comparison-chart {
  height: 320px;
}

.daily-chart {
  height: 280px;
}

.power-chart {
  height: 230px;
}

.text-muted {
  color: rgba(255, 255, 255, 0.55) !important;
}

@media (max-width: 900px) {
  .bill-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .bill-grid__value {
    text-align: left;
  }

  .bill-grid--head {
    display: none;
  }

  .bill-row {
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    margin-bottom: 10px;
  }
}
</style>
