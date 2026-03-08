<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-flash-outline" class="mr-2" color="primary"></v-icon>
      Monitoreo de Energía
    </h2>

    <v-row dense>
      <v-col cols="12">
        <v-card class="pa-4 mb-4" border="opacity-10">
          <div class="text-overline text-muted mb-2">Potencia en Tiempo Real</div>
          <div class="chart-container" style="height: 250px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card class="pa-3" variant="outlined">
          <div class="text-caption text-muted">Voltaje RMS</div>
          <div class="text-h6 font-weight-bold">{{ store.energia.actual?.voltaje || 0 }} V</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card class="pa-3" variant="outlined">
          <div class="text-caption text-muted">Corriente RMS</div>
          <div class="text-h6 font-weight-bold">{{ store.energia.actual?.corriente || 0 }} A</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { useAppStore } from '../store/app.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const store = useAppStore()

const chartData = computed(() => ({
  labels: ['10s', '8s', '6s', '4s', '2s', '0s'],
  datasets: [
    {
      label: 'Potencia (W)',
      backgroundColor: 'rgba(0, 206, 201, 0.1)',
      borderColor: '#00cec9',
      data: [400, 350, 420, 380, 410, 390], // Demo data
      fill: true,
      tension: 0.4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#636e72' } },
    x: { grid: { display: false }, ticks: { color: '#636e72' } }
  }
}
</script>
