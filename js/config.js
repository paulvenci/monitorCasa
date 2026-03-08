// Configuración de Supabase
const SUPABASE_URL = 'https://vlccxzzbfuammgyxzogb.supabase.co';

// ⚠️ IMPORTANTE: Reemplaza esta clave con tu clave anónima real de Supabase
// Para obtenerla:
// 1. Ve a https://supabase.com/dashboard/project/vlccxzzbfuammgyxzogb
// 2. Settings → API
// 3. Copia "anon public" key (empieza con "eyJ...")
const SUPABASE_ANON_KEY = 'sb_publishable_QM0Sst87rAe1Z1DdzJiVOg_pPKmmxEl';

// Intervalos de actualización (milisegundos)
const UPDATE_INTERVALS = {
    realtime: 5000,      // 5 segundos para datos en tiempo real
    charts: 30000,       // 30 segundos para gráficos
    events: 60000        // 1 minuto para eventos
};

// Configuración de gráficos
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#b2bec3'
            }
        }
    },
    scales: {
        x: {
            ticks: { color: '#b2bec3' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
            ticks: { color: '#b2bec3' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
    }
};

// Exportar configuración
window.CONFIG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    UPDATE_INTERVALS,
    CHART_CONFIG
};
