<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold d-flex align-center">
        <v-icon icon="mdi-cog-outline" class="mr-2" color="muted"></v-icon>
        Configuracion
      </h2>
    </div>

    <v-tabs v-model="configTab" bg-color="transparent" color="primary" class="mb-4">
      <v-tab value="tarifas">Tarifas</v-tab>
      <v-tab value="facturacion">Facturacion</v-tab>
      <v-tab value="tanque">Tanque</v-tab>
      <v-tab value="sistema">Sistema</v-tab>
    </v-tabs>

    <v-window v-model="configTab">
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
              label="Cargo Transmision x kWh ($)"
              type="number"
              v-model.number="localConfig.cargo_transmision"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit" :loading="savingTarifas">Guardar Tarifas</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="facturacion">
        <v-card class="pa-4" border="opacity-10">
          <div class="text-subtitle-1 font-weight-bold mb-1">Perfil de referencia de boleta</div>
          <div class="text-caption text-muted mb-4">
            Estos parametros alimentan la comparacion previa entre la cuenta estimada y tu monitoreo.
          </div>

          <v-form @submit.prevent="saveFacturacion">
            <v-select
              label="Empresa distribuidora"
              :items="distribuidoras"
              v-model="localBilling.distribuidora"
              variant="outlined"
              density="compact"
            ></v-select>
            <v-text-field
              label="Comuna"
              v-model="localBilling.comuna"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Region"
              v-model="localBilling.region"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Dia de inicio del ciclo"
              type="number"
              v-model.number="localBilling.ciclo_inicio_dia"
              variant="outlined"
              density="compact"
              hint="Referencia para identificar el periodo de boleta"
              persistent-hint
            ></v-text-field>
            <v-text-field
              label="Duracion del ciclo (dias)"
              type="number"
              v-model.number="localBilling.ciclo_duracion_dias"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Factor ajuste kWh"
              type="number"
              step="0.001"
              v-model.number="localBilling.factor_ajuste_kwh"
              variant="outlined"
              density="compact"
              hint="Ejemplo 1.035 para sumar 3,5% sobre lo medido"
              persistent-hint
            ></v-text-field>
            <v-text-field
              label="Porcentaje impuestos"
              type="number"
              step="0.001"
              v-model.number="localBilling.porcentaje_impuestos"
              variant="outlined"
              density="compact"
              hint="Usa decimal, por ejemplo 0.035"
              persistent-hint
            ></v-text-field>
            <v-text-field
              label="Porcentaje otros cargos"
              type="number"
              step="0.001"
              v-model.number="localBilling.porcentaje_otros_cargos"
              variant="outlined"
              density="compact"
              hint="Ajustes, reliquidaciones o redondeos referenciales"
              persistent-hint
            ></v-text-field>

            <div class="reference-preview pa-4 rounded-lg mb-3">
              <div class="text-overline text-primary mb-1">Vista previa</div>
              <div class="text-caption text-muted mb-2">
                {{ localBilling.distribuidora }} | {{ localBilling.comuna }}, {{ localBilling.region }}
              </div>
              <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                <div>
                  <div class="text-caption text-muted">kWh medidos</div>
                  <div class="text-h6 font-weight-bold">{{ store.formatNumber(store.energiaMes, 2) }}</div>
                </div>
                <div>
                  <div class="text-caption text-muted">kWh referenciales</div>
                  <div class="text-h6 font-weight-bold">{{ store.formatNumber(previewAdjustedKwh, 2) }}</div>
                </div>
                <div>
                  <div class="text-caption text-muted">Ciclo</div>
                  <div class="text-h6 font-weight-bold">{{ localBilling.ciclo_duracion_dias }} dias</div>
                </div>
              </div>
            </div>

            <v-btn color="primary" block class="mt-2" type="submit" :loading="savingFacturacion">Guardar Perfil de Facturacion</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="tanque">
        <v-card class="pa-4" border="opacity-10">
          <v-form @submit.prevent="saveTanque">
            <v-text-field
              label="Altura Maxima Sensor (cm)"
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
              label="Umbral Alerta Critico (%)"
              type="number"
              v-model.number="localConfig.umbral_nivel_critico"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit" :loading="savingTanque">Guardar Parametros</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="sistema">
        <v-card class="pa-4 text-center" border="opacity-10">
          <v-icon icon="mdi-information-outline" color="primary" size="large" class="mb-2"></v-icon>
          <div class="text-subtitle-1 font-weight-bold">Electrosun Monitor</div>
          <div class="text-caption text-muted mb-4">Version 2.0 (Vue + Vuetify)</div>

          <v-divider class="mb-4 border-opacity-10"></v-divider>

          <v-btn variant="tonal" color="error" block @click="logout">
            Cerrar Sesion
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
import { ref, onMounted, watch, computed } from 'vue'
import { useAppStore } from '../store/app.js'

const store = useAppStore()
const configTab = ref('tarifas')
const savingTarifas = ref(false)
const savingTanque = ref(false)
const savingFacturacion = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const distribuidoras = ['Enel', 'CGE', 'Saesa', 'Frontel', 'Chilquinta', 'Coelcha', 'Litoral', 'Otra']

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

const localBilling = ref({
  distribuidora: 'Enel',
  comuna: 'Santiago',
  region: 'Metropolitana',
  ciclo_inicio_dia: 1,
  ciclo_duracion_dias: 30,
  factor_ajuste_kwh: 1.035,
  porcentaje_impuestos: 0.035,
  porcentaje_otros_cargos: 0.018
})

const previewAdjustedKwh = computed(() => {
  return Number(store.energiaMes || 0) * Number(localBilling.value.factor_ajuste_kwh || 1)
})

onMounted(() => {
  store.loadLocalBillingProfile()

  if (store.config) {
    Object.assign(localConfig.value, store.config)
  } else {
    store.fetchConfig().then(() => {
      Object.assign(localConfig.value, store.config)
    })
  }

  Object.assign(localBilling.value, store.billingProfile)
})

watch(() => store.config, (newVal) => {
  if (newVal) {
    Object.assign(localConfig.value, newVal)
  }
}, { deep: true })

watch(() => store.billingProfile, (newVal) => {
  if (newVal) {
    Object.assign(localBilling.value, newVal)
  }
}, { deep: true })

const handleSave = async (keysToSave, savingRef) => {
  savingRef.value = true
  const partialConfig = {}
  keysToSave.forEach((k) => { partialConfig[k] = localConfig.value[k] })

  const { error } = await store.saveConfig(partialConfig)
  savingRef.value = false

  if (!error) {
    snackbar.value = { show: true, text: 'Configuracion guardada exitosamente', color: 'success' }
  } else {
    snackbar.value = { show: true, text: 'Error al guardar la configuracion', color: 'error' }
  }
}

const saveTarifas = () => {
  handleSave(['tarifa_activa', 'tarifa_kwh_invierno', 'tarifa_kwh_verano', 'cargo_fijo', 'cargo_transmision'], savingTarifas)
}

const saveTanque = () => {
  handleSave(['tanque_altura_cm', 'tanque_capacidad_litros', 'umbral_nivel_bajo', 'umbral_nivel_critico'], savingTanque)
}

const saveFacturacion = async () => {
  savingFacturacion.value = true
  const { error } = store.saveLocalBillingProfile(localBilling.value)
  savingFacturacion.value = false

  if (!error) {
    snackbar.value = { show: true, text: 'Perfil de facturacion guardado en este navegador', color: 'success' }
  } else {
    snackbar.value = { show: true, text: 'No se pudo guardar el perfil local', color: 'error' }
  }
}

const logout = () => {
  alert('Cerrando sesion...')
}
</script>

<style scoped>
.reference-preview {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.text-muted {
  color: #b2bec3 !important;
}
</style>
