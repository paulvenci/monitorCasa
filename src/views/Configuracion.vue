<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-cog-outline" class="mr-2" color="muted"></v-icon>
      Configuración
    </h2>

    <v-tabs v-model="configTab" bg-color="transparent" color="primary" class="mb-4">
      <v-tab value="tarifas">Tarifas</v-tab>
      <v-tab value="tanque">Tanque</v-tab>
      <v-tab value="sistema">Sistema</v-tab>
    </v-tabs>

    <v-window v-model="configTab">
      <v-window-item value="tarifas">
        <v-card class="pa-4" border="opacity-10">
          <v-form @submit.prevent="saveConfig">
            <v-select
              label="Tarifa Activa"
              :items="['Invierno', 'Verano']"
              variant="outlined"
              density="compact"
            ></v-select>
            <v-text-field
              label="Precio kWh ($)"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Cargo Fijo Mensual ($)"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit">Guardar Tarifas</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="tanque">
        <v-card class="pa-4" border="opacity-10">
          <v-form @submit.prevent="saveConfig">
            <v-text-field
              label="Altura Tanque (cm)"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-text-field
              label="Capacidad (Litros)"
              type="number"
              variant="outlined"
              density="compact"
            ></v-text-field>
            <v-btn color="primary" block class="mt-2" type="submit">Guardar Parámetros</v-btn>
          </v-form>
        </v-card>
      </v-window-item>

      <v-window-item value="sistema">
        <v-card class="pa-4 text-center" border="opacity-10">
          <v-icon icon="mdi-information-outline" color="primary" size="large" class="mb-2"></v-icon>
          <div class="text-subtitle-1 font-weight-bold">Información del Sistema</div>
          <div class="text-caption text-muted mb-4">Versión 2.0 (Vue + Vuetify)</div>
          
          <v-divider class="mb-4 border-opacity-10"></v-divider>
          
          <v-btn variant="tonal" color="error" block @click="logout">
            Cerrar Sesión
          </v-btn>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const configTab = ref('tarifas')

const saveConfig = () => {
  // Implementación de guardado en Supabase
  console.log('Guardando configuración...')
}

const logout = () => {
  // Implementación de logout
  alert('Cerrando sesión...')
}
</script>

<style scoped>
.text-muted {
  color: #b2bec3 !important;
}
</style>
