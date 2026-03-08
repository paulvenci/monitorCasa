<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold d-flex align-center">
        <v-icon icon="mdi-cog-outline" class="mr-2" color="muted"></v-icon>
        Configuración
      </h2>
    </div>

    <v-tabs v-model="configTab" bg-color="transparent" color="primary" class="mb-4">
      <v-tab value="tarifas">Tarifas</v-tab>
      <v-tab value="tanque">Tanque</v-tab>
      <v-tab value="sistema">Sistema</v-tab>
    </v-tabs>

    <v-window v-model="configTab">
      <!-- Pestaña de Tarifas -->
      <v-window-item value="tarifas">
        <v-card class="pa-4" border="opacity-10">
          <v-form @submit.prevent="saveTarifas">
            <v-select
              label="Tarifa Activa"
              :items="[{title: 'Invierno', value: 'invierno'}, {title: 'Verano', value: 'verano'}]"
              item-title="title"
              item-value="value"
              v-model="localConfig.tarifa_activa"
              variant="outlined"
              density="compact"
            ></v-select>
            <v-text-field
              label="Precio kWh Invierno ($)"
              type="number"
              v-model.number="localConfig.tarifa_kwh_invierno"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Precio kWh Verano ($)"
              type="number"
              v-model.number="localConfig.tarifa_kwh_verano"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Cargo Fijo Mensual ($)"
              type="number"
              v-model.number="localConfig.cargo_fijo"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Cargo Transmisión x kWh ($)"
              type="number"
              v-model.number="localConfig.cargo_transmision"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit" :loading="saving">Guardar Tarifas</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <!-- Pestaña de Tanque -->
      <v-window-item value="tanque">
        <v-card class="pa-4" border="opacity-10">
          <v-form @submit.prevent="saveTanque">
            <v-text-field
              label="Altura Máxima Sensor (cm)"
              type="number"
              v-model.number="localConfig.tanque_altura_cm"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Capacidad Max (Litros)"
              type="number"
              v-model.number="localConfig.tanque_capacidad_litros"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Umbral Alerta Bajo (%)"
              type="number"
              v-model.number="localConfig.umbral_nivel_bajo"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Umbral Alerta Crítico (%)"
              type="number"
              v-model.number="localConfig.umbral_nivel_critico"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit" :loading="saving">Guardar Parámetros</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="sistema">
        <v-card class="pa-4 text-center" border="opacity-10">
          <v-icon icon="mdi-information-outline" color="primary" size="large" class="mb-2"></v-icon>
          <div class="text-subtitle-1 font-weight-bold">Electrosun Monitor</div>
          <div class="text-caption text-muted mb-4">Versión 2.0 (Vue + Vuetify)</div>
          
          <v-divider class="mb-4 border-opacity-10"></v-divider>
          
          <v-btn variant="tonal" color="error" block @click="logout">
            Cerrar Sesión
          </v-btn>
        </v-card>
      </v-window-item>
    </v-window>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()
const configTab = ref('tarifas')
const saving = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const localConfig = ref({
  tarifa_activa: 'invierno',
  tarifa_kwh_invierno: 0,
  tarifa_kwh_verano: 0,
  cargo_fijo: 0,
  cargo_transmision: 0,
  tanque_altura_cm: 150,
  tanque_capacidad_litros: 1000,
  umbral_nivel_bajo: 20,
  umbral_nivel_critico: 10
})

// Cargar la configuración actual cuando el componente se monta
onMounted(() => {
  if (store.config) {
    Object.assign(localConfig.value, store.config)
  } else {
    store.fetchConfig().then(() => {
      Object.assign(localConfig.value, store.config)
    })
  }
})

// Mantener sincronizado si cambia remotamente
watch(() => store.config, (newVal) => {
  if (newVal) {
    Object.assign(localConfig.value, newVal)
  }
}, { deep: true })

const handleSave = async (keysToSave) => {
  saving.value = true
  const partialConfig = {}
  keysToSave.forEach(k => { partialConfig[k] = localConfig.value[k] })
  
  const { error } = await store.saveConfig(partialConfig)
  saving.value = false
  
  if (!error) {
    snackbar.value = { show: true, text: 'Configuración guardada exitosamente', color: 'success' }
  } else {
    snackbar.value = { show: true, text: 'Error al guardar la configuración', color: 'error' }
  }
}

const saveTarifas = () => {
  handleSave(['tarifa_activa', 'tarifa_kwh_invierno', 'tarifa_kwh_verano', 'cargo_fijo', 'cargo_transmision'])
}

const saveTanque = () => {
  handleSave(['tanque_altura_cm', 'tanque_capacidad_litros', 'umbral_nivel_bajo', 'umbral_nivel_critico'])
}

const logout = () => {
  alert('Cerrando sesión...')
}
</script>

<style scoped>
.text-muted {
  color: #b2bec3 !important;
}
</style>
