<template>
  <v-app>
    <!-- Header principal -->
    <v-app-bar flat border color="background">
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
          class="status-chip"
        >
          <v-icon start icon="mdi-circle-medium" :class="{ 'pulse': isConnected }"></v-icon>
          {{ isConnected ? 'Conectado' : 'Sin Conexión' }}
        </v-chip>
      </div>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main class="background text-primary">
      <v-container fluid class="pa-4 pb-16">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Navegación inferior para Mobile-First -->
    <v-bottom-navigation
      v-model="tab"
      grow
      color="primary"
      bg-color="surface"
      elevation="8"
      border="top"
    >
      <v-btn to="/">
        <v-icon icon="mdi-view-dashboard"></v-icon>
        <span>Dashboard</span>
      </v-btn>

      <v-btn to="/energia">
        <v-icon icon="mdi-flash"></v-icon>
        <span>Energía</span>
      </v-btn>

      <v-btn to="/agua">
        <v-icon icon="mdi-water"></v-icon>
        <span>Agua</span>
      </v-btn>

      <v-btn to="/eventos">
        <v-icon icon="mdi-bell"></v-icon>
        <span>Eventos</span>
      </v-btn>
      
      <v-btn to="/configuracion">
        <v-icon icon="mdi-cog"></v-icon>
        <span>Ajustes</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const tab = ref(0)
const isConnected = ref(true) // Simulado por ahora
</script>

<style>
.logo-text {
  font-weight: 700;
  font-size: 1.4rem;
  background: linear-gradient(135deg, #00cec9, #0984e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

html {
  overflow-y: auto !important;
}

.v-main {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
}
</style>
