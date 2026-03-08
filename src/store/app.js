import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

export const useAppStore = defineStore('app', {
    state: () => ({
        supabase: null,
        energia: {
            actual: null,
            historial24h: [],
            historialDiario: [],
            historialPower: [], // Datos para el gráfico de potencia con filtros
        },
        agua: {
            actual: null,
            historial7d: [],
        },
        config: {
            tanque_capacidad_litros: 1000,
            tanque_altura_cm: 150,
            umbral_nivel_bajo: 20,
        },
        eventos: [],
        isConnected: false,
        loading: false,
    }),

    getters: {
        formatNumber: () => (val, decimals = 2) => {
            if (val === null || val === undefined) return '--'
            return Number(val).toLocaleString('es-CL', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })
        },

        timeSince: () => (dateString) => {
            if (!dateString) return ''
            const date = new Date(dateString)
            const seconds = Math.floor((new Date() - date) / 1000)
            if (seconds < 60) return 'hace instantes'
            const minutes = Math.floor(seconds / 60)
            if (minutes < 60) return `hace ${minutes}m`
            const hours = Math.floor(minutes / 60)
            if (hours < 24) return `hace ${hours}h`
            return date.toLocaleDateString()
        },

        energiaMes: (state) => {
            return state.energia.actual?.energia_kwh || 0
        },

        costoProyectado: (state) => {
            if (!state.config || !state.energia.actual) return 0

            const tarifaActiva = state.config.tarifa_activa === 'invierno'
                ? state.config.tarifa_kwh_invierno
                : state.config.tarifa_kwh_verano

            const consumo = state.energia.actual.energia_kwh || 0
            const costoVariable = consumo * tarifaActiva
            const cargoFijo = state.config.cargo_fijo || 0
            const cargoTransmision = (state.config.cargo_transmision || 0) * consumo

            return Math.round(costoVariable + cargoFijo + cargoTransmision)
        }
    },

    actions: {
        async initSupabase(url, key) {
            this.supabase = createClient(url, key)
            await this.checkConnection()
            if (this.isConnected) {
                this.fetchConfig()
            }
        },

        async fetchConfig() {
            const { data, error } = await this.supabase
                .from('configuracion')
                .select('*')
                .single()

            if (!error && data) {
                this.config = data
            }
        },

        async saveConfig(newConfig) {
            const { error } = await this.supabase
                .from('configuracion')
                .update(newConfig)
                .eq('id', 1)

            if (!error) {
                this.config = { ...this.config, ...newConfig }
            }
            return { error }
        },

        async checkConnection() {
            try {
                const { error } = await this.supabase.from('configuracion').select('id').limit(1)
                this.isConnected = !error
            } catch (e) {
                this.isConnected = false
            }
        },

        async fetchEnergiaRealtime() {
            const { data, error } = await this.supabase
                .from('lecturas_energia')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)

            if (!error && data.length > 0) {
                this.energia.actual = data[0]
            }
        },

        async fetchEnergiaHistorial() {
            // Este es el fallback para tiempo real / últimos registros
            const { data, error } = await this.supabase
                .from('lecturas_energia')
                .select('created_at, potencia')
                .order('created_at', { ascending: false })
                .limit(20)

            if (!error && data) {
                this.energia.historial24h = data.reverse()
            }
        },

        async fetchEnergiaPower(range = 'hoy') {
            let query = this.supabase.from('lecturas_energia').select('created_at, potencia')

            if (range === 'hoy') {
                const today = new Date().toISOString().split('T')[0]
                query = query
                    .gte('created_at', `${today}T00:00:00`)
                    .order('created_at', { ascending: true })
            } else if (range === 'semana') {
                // Usamos la vista diaria para tendencias
                const { data, error } = await this.supabase
                    .from('vista_energia_diaria')
                    .select('fecha, max_kwh, max_potencia') // Asumiendo que agregamos max_potencia a la vista
                    .limit(7)

                if (!error && data) {
                    this.energia.historialPower = data.reverse().map(d => ({
                        created_at: d.fecha,
                        potencia: d.max_potencia || 0
                    }))
                }
                return
            } else if (range === 'mes') {
                const { data, error } = await this.supabase
                    .from('vista_energia_diaria')
                    .select('fecha, max_potencia')
                    .limit(30)

                if (!error && data) {
                    this.energia.historialPower = data.reverse().map(d => ({
                        created_at: d.fecha,
                        potencia: d.max_potencia || 0
                    }))
                }
                return
            }

            const { data, error } = await query
            if (!error && data) {
                this.energia.historialPower = data
            }
        },

        async fetchEnergiaDiaria() {
            // Obtener el máximo de kWh por día usando la vista SQL
            const { data, error } = await this.supabase
                .from('vista_energia_diaria')
                .select('*')
                .limit(7)

            if (!error && data) {
                // Calcular consumos por día (delta) ordenando del más antiguo al más reciente
                // Asumiendo que data viene ordenado DESC por fecha
                const ordenado = data.reverse();
                const consumos = [];
                for (let i = 0; i < ordenado.length; i++) {
                    // Simplificación: usaremos el max_kwh del día directo o calcular la diferencia si aplica.
                    // Dependiendo de cómo funcione 'energia_kwh' en ESP, si se resetea mensual, a veces el max_kwh del día menos el del día anterior da el consumo diario.
                    // Para evitar complejidad, mostraremos la diferencia con el día anterior, o 0 si es el primero.
                    let consumoDia = ordenado[i].max_kwh;
                    if (i > 0) {
                        consumoDia = ordenado[i].max_kwh - ordenado[i - 1].max_kwh;
                        if (consumoDia < 0) consumoDia = ordenado[i].max_kwh; // Posible reset de mes
                    }
                    consumos.push({
                        fecha: ordenado[i].fecha,
                        kwh: Math.max(0, consumoDia)
                    });
                }
                this.energia.historialDiario = consumos;
            }
        },

        async fetchAguaRealtime() {
            const { data, error } = await this.supabase
                .from('lecturas_agua')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)

            if (!error && data.length > 0) {
                this.agua.actual = data[0]
            }
        },

        async fetchEventos() {
            const { data, error } = await this.supabase
                .from('eventos')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (!error) {
                this.eventos = data
            }
        },

        setupRealtimeSubscriptions() {
            // Configurar Realtime de Supabase aquí si es necesario
            this.supabase
                .channel('schema-db-changes')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lecturas_energia' }, (payload) => {
                    this.energia.actual = payload.new
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lecturas_agua' }, (payload) => {
                    this.agua.actual = payload.new
                })
                .subscribe()
        }
    }
})
