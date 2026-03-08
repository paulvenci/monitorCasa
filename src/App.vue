<template>
  <v-app class="electrosun-app">
    <!-- Header principal -->
    <v-app-bar flat border="0" color="transparent" class="px-2 glass-header">
      <template v-slot:prepend>
        <div class="logo-container ml-2">
          <span class="logo-text">⚡ Electrosun</span>
        </div>
      </template>
      
      <v-spacer></v-spacer>

      <div class="mr-4 header-status">
        <v-chip
          size="small"
          :color="isConnected ? 'success' : 'error'"
          variant="flat"
          class="status-chip neon-chip"
        >
          <v-icon start icon="mdi-circle-medium" :class="{ 'pulse': isConnected }"></v-icon>
          {{ isConnected ? 'Conectado' : 'Sin Conexión' }}
        </v-chip>
      </div>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main class="text-primary main-content">
      <v-container fluid class="pa-4 pb-16">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Navegación inferior para Mobile-First (Estilo Premium) -->
    <v-bottom-navigation
      v-model="tab"
      grow
      color="primary"
      bg-color="transparent"
      elevation="0"
      class="glass-nav mb-2 mx-auto rounded-pill"
      height="64"
    >
      <v-btn to="/" value="dashboard" class="nav-btn">
        <v-icon icon="mdi-view-dashboard-variant-outline" size="20"></v-icon>
        <span class="nav-text">Dash</span>
      </v-btn>

      <v-btn to="/energia" value="energia" class="nav-btn">
        <v-icon icon="mdi-lightning-bolt-outline" size="20"></v-icon>
        <span class="nav-text">Energía</span>
      </v-btn>

      <v-btn to="/agua" value="agua" class="nav-btn">
        <v-icon icon="mdi-water-outline" size="20"></v-icon>
        <span class="nav-text">Agua</span>
      </v-btn>

      <v-btn to="/eventos" value="eventos" class="nav-btn">
        <v-icon icon="mdi-bell-outline" size="20"></v-icon>
        <span class="nav-text">Alertas</span>
      </v-btn>
      
      <v-btn to="/configuracion" value="config" class="nav-btn">
        <v-icon icon="mdi-tune-vertical" size="20"></v-icon>
        <span class="nav-text">Ajustes</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from './store/app.js'

const store = useAppStore()

const tab = ref('dashboard')
const isConnected = computed(() => store.isConnected)
</script>

<style>
/* Estilos Globales de Electrosun */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');

html, body, .v-application {
  font-family: 'Outfit', sans-serif !important;
  background-color: #04040a !important;
  overflow: hidden;
}

.electrosun-app {
  background: radial-gradient(circle at 50% 10%, #16213e 0%, #04040a 100%) !important;
  min-height: 100vh;
}

.main-content {
  position: relative;
  overflow-y: auto;
  height: 100vh;
  padding-bottom: 90px !important; /* Espacio para el nav flotante */
}

.logo-text {
  font-weight: 900;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #00cec9 0%, #0984e3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
}

.glass-header {
  backdrop-filter: blur(8px);
  background: rgba(4, 4, 10, 0.4) !important;
}

.glass-nav {
  background: rgba(22, 33, 62, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  position: fixed !important;
  bottom: 0px;
  left: 0;
  right: 0;
  margin: 10px 12px 16px 12px !important;
  width: auto !important;
  max-width: 500px;
}

.nav-btn {
  min-width: 60px !important;
  padding: 0 4px !important;
}

.nav-text {
  font-size: 0.65rem !important;
  font-weight: 600;
  text-transform: none !important;
  margin-top: 2px;
}

.v-bottom-navigation__content {
  justify-content: space-evenly !important;
}

.neon-chip {
  box-shadow: 0 0 10px rgba(0, 184, 148, 0.2);
  border: 1px solid rgba(0, 184, 148, 0.3);
}

.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* Scrollbar Personalizada */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 206, 201, 0.2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 206, 201, 0.5);
}
</style>
