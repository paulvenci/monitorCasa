<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-bell-outline" class="mr-2" color="accent"></v-icon>
      Registro de Eventos
    </h2>

    <v-card border="opacity-10" class="overflow-hidden">
      <v-tabs v-model="filter" grow bg-color="surface">
        <v-tab value="all">Todos</v-tab>
        <v-tab value="energia">Energía</v-tab>
        <v-tab value="agua">Agua</v-tab>
      </v-tabs>

      <v-window v-model="filter">
        <v-window-item value="all">
          <v-list bg-color="transparent">
            <template v-for="(evento, i) in filteredEventos" :key="evento.id">
              <v-list-item
                :title="evento.titulo"
                :subtitle="evento.descripcion"
                class="py-3"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getEventColor(evento.tipo)" size="40">
                    <v-icon :icon="getEventIcon(evento.tipo)" color="white"></v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append>
                  <div class="text-caption text-muted">{{ formatDate(evento.created_at) }}</div>
                </template>
              </v-list-item>
              <v-divider v-if="i < filteredEventos.length - 1" class="border-opacity-10 mx-4"></v-divider>
            </template>
            <div v-if="filteredEventos.length === 0" class="pa-8 text-center text-muted italic">
              No hay eventos que mostrar
            </div>
          </v-list>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()
const filter = ref('all')

const filteredEventos = computed(() => {
  if (filter.value === 'all') return store.eventos
  return store.eventos.filter(e => e.origen === filter.value)
})

const getEventColor = (tipo) => {
  const colors = {
    'corte_luz': 'error',
    'restauracion_luz': 'success',
    'consumo_alto': 'warning',
    'nivel_bajo': 'secondary',
    'nivel_critico': 'error',
    'bateria_baja': 'warning'
  }
  return colors[tipo] || 'primary'
}

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
</script>

<style scoped>
.text-muted {
  color: #b2bec3 !important;
}
</style>
