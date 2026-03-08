import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

export const useAppStore = defineStore('app', {
    state: () => ({
        supabase: null,
        energia: {
            actual: null,
            historial24h: [],
        },
        agua: {
            actual: null,
            historial7d: [],
        },
        eventos: [],
        isConnected: false,
        loading: false,
    }),

    actions: {
        initSupabase(url, key) {
            this.supabase = createClient(url, key)
            this.checkConnection()
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
