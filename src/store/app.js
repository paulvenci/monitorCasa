import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_BILLING_PROFILE = {
    distribuidora: 'Enel',
    comuna: 'Santiago',
    region: 'Metropolitana',
    ciclo_inicio_dia: 1,
    ciclo_duracion_dias: 30,
    factor_ajuste_kwh: 1.035,
    porcentaje_impuestos: 0.035,
    porcentaje_otros_cargos: 0.018,
}

const safeNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

export const useAppStore = defineStore('app', {
    state: () => ({
        supabase: null,
        energia: {
            actual: null,
            historial24h: [],
            historialDiario: [],
            historialPower: [],
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
        billingProfile: { ...DEFAULT_BILLING_PROFILE },
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
            return safeNumber(state.energia.actual?.energia_kwh, 0)
        },

        activeTariff(state) {
            if (state.config?.tarifa_activa === 'invierno') {
                return safeNumber(state.config?.tarifa_kwh_invierno, 0)
            }
            return safeNumber(state.config?.tarifa_kwh_verano, 0)
        },

        monitorEstimate() {
            const kwh = safeNumber(this.energiaMes, 0)
            const energyCharge = kwh * this.activeTariff
            const fixedCharge = safeNumber(this.config?.cargo_fijo, 0)
            const transmission = kwh * safeNumber(this.config?.cargo_transmision, 0)
            const subtotal = energyCharge + fixedCharge + transmission

            return {
                kwh,
                energyCharge,
                fixedCharge,
                transmission,
                taxes: subtotal * 0.02,
                total: subtotal,
            }
        },

        invoiceReference() {
            const adjustedKwh = safeNumber(this.energiaMes, 0) * safeNumber(this.billingProfile.factor_ajuste_kwh, 1.035)
            const energyCharge = adjustedKwh * this.activeTariff
            const fixedCharge = safeNumber(this.config?.cargo_fijo, 0)
            const transmission = adjustedKwh * safeNumber(this.config?.cargo_transmision, 0)
            const subtotal = energyCharge + fixedCharge + transmission
            const taxes = subtotal * safeNumber(this.billingProfile.porcentaje_impuestos, 0.035)
            const otherCharges = subtotal * safeNumber(this.billingProfile.porcentaje_otros_cargos, 0.018)

            return {
                kwh: adjustedKwh,
                energyCharge,
                fixedCharge,
                transmission,
                taxes,
                otherCharges,
                total: subtotal + taxes + otherCharges,
            }
        },

        billingDays() {
            return Math.max(1, Math.round(safeNumber(this.billingProfile.ciclo_duracion_dias, 30)))
        },

        billingPeriodRange() {
            const end = this.energia.actual?.created_at ? new Date(this.energia.actual.created_at) : new Date()
            const start = new Date(end)
            start.setDate(start.getDate() - (this.billingDays - 1))
            return { start, end }
        },

        costoProyectado() {
            return Math.round(this.monitorEstimate.total || 0)
        }
    },

    actions: {
        loadLocalBillingProfile() {
            if (typeof window === 'undefined') return
            try {
                const raw = window.localStorage.getItem('electrosun.billingProfile')
                if (!raw) return
                const parsed = JSON.parse(raw)
                this.billingProfile = { ...DEFAULT_BILLING_PROFILE, ...parsed }
            } catch (error) {
                this.billingProfile = { ...DEFAULT_BILLING_PROFILE }
            }
        },

        saveLocalBillingProfile(newProfile) {
            this.billingProfile = { ...this.billingProfile, ...newProfile }
            if (typeof window === 'undefined') return { error: null }
            try {
                window.localStorage.setItem('electrosun.billingProfile', JSON.stringify(this.billingProfile))
                return { error: null }
            } catch (error) {
                return { error }
            }
        },

        async initSupabase(url, key) {
            this.loadLocalBillingProfile()
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
                const { data, error } = await this.supabase
                    .from('vista_energia_diaria')
                    .select('fecha, max_kwh, max_potencia')
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
            const { data, error } = await this.supabase
                .from('vista_energia_diaria')
                .select('*')
                .limit(7)

            if (!error && data) {
                const ordenado = data.reverse()
                const consumos = []
                for (let i = 0; i < ordenado.length; i++) {
                    let consumoDia = ordenado[i].max_kwh
                    if (i > 0) {
                        consumoDia = ordenado[i].max_kwh - ordenado[i - 1].max_kwh
                        if (consumoDia < 0) consumoDia = ordenado[i].max_kwh
                    }
                    consumos.push({
                        fecha: ordenado[i].fecha,
                        kwh: Math.max(0, consumoDia)
                    })
                }
                this.energia.historialDiario = consumos
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
