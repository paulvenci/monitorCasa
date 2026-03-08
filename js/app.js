// Aplicación principal - Electrosun Monitor

// Cliente de Supabase
const { createClient } = supabase;
const supabaseClient = createClient(
    window.CONFIG.SUPABASE_URL,
    window.CONFIG.SUPABASE_ANON_KEY
);

// Estado de la aplicación
const appState = {
    currentTab: 'dashboard',
    isConnected: false,
    lastUpdate: null,
    updateIntervals: {}
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando Electrosun Monitor...');

    // Inicializar navegación por pestañas
    initTabs();

    // Inicializar gráficos
    window.Charts.init();

    // Verificar conexión a Supabase
    testConnection();

    // Cargar datos iniciales
    loadInitialData();

    // Configurar actualizaciones automáticas
    setupAutoUpdate();

    // Configurar filtros de eventos
    setupEventFilters();

    // Configurar formularios de configuración
    setupConfigForms();

    console.log('✅ Aplicación inicializada');
});

// ============================================
// NAVEGACIÓN
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Actualizar botones
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    appState.currentTab = tabName;

    // Cargar datos específicos de la pestaña
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch (tabName) {
        case 'energia':
            loadEnergiaData();
            break;
        case 'agua':
            loadAguaData();
            break;
        case 'eventos':
            loadEventosData();
            break;
        case 'configuracion':
            loadConfiguracionData();
            break;
    }
}

// ============================================
// CONEXIÓN A SUPABASE
// ============================================

async function testConnection() {
    try {
        const { data, error } = await supabaseClient
            .from('configuracion')
            .select('*')
            .limit(1);

        if (error) throw error;

        updateConnectionStatus(true);
        console.log('✅ Conectado a Supabase');
    } catch (error) {
        updateConnectionStatus(false);
        console.error('❌ Error de conexión:', error);
        window.Utils.showNotification('Error de conexión a Supabase', 'error');
    }
}

function updateConnectionStatus(isConnected) {
    appState.isConnected = isConnected;
    const statusEl = document.getElementById('connectionStatus');
    const dot = statusEl.querySelector('.status-dot');
    const text = statusEl.querySelector('.status-text');

    if (isConnected) {
        dot.style.background = '#00b894';
        text.textContent = 'Conectado';
    } else {
        dot.style.background = '#d63031';
        text.textContent = 'Desconectado';
    }
}

// ============================================
// CARGA DE DATOS
// ============================================

async function loadInitialData() {
    await Promise.all([
        loadEnergiaRealtime(),
        loadAguaRealtime(),
        loadConsumo24h(),
        loadNivelAgua7d(),
        loadEventosRecientes(),
        loadEstadisticasMes()
    ]);
}

// Datos de energía en tiempo real
async function loadEnergiaRealtime() {
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_energia')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            updateEnergiaUI(data[0]);
        }
    } catch (error) {
        console.error('Error cargando energía:', error);
    }
}

// Datos de agua en tiempo real
async function loadAguaRealtime() {
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_agua')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            updateAguaUI(data[0]);
        }
    } catch (error) {
        console.error('Error cargando agua:', error);
    }
}

// Consumo últimas 24 horas
async function loadConsumo24h() {
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_energia')
            .select('created_at, potencia')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
            window.Charts.updateConsumo24h(data);
        }
    } catch (error) {
        console.error('Error cargando consumo 24h:', error);
    }
}

// Nivel de agua últimos 7 días
async function loadNivelAgua7d() {
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_agua')
            .select('created_at, nivel_porcentaje')
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
            window.Charts.updateNivelAgua(data);
        }
    } catch (error) {
        console.error('Error cargando nivel agua 7d:', error);
    }
}

// Eventos recientes
async function loadEventosRecientes() {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        updateEventosUI(data || []);
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }
}

// Estadísticas del mes
async function loadEstadisticasMes() {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data, error } = await supabaseClient
            .from('lecturas_energia')
            .select('energia_kwh, costo_estimado')
            .gte('created_at', startOfMonth.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            const consumo = data[0].energia_kwh;
            const costo = data[0].costo_estimado;
            const diasMes = new Date().getDate();
            const promedio = consumo / diasMes;

            document.getElementById('consumoMes').textContent = `${window.Utils.formatNumber(consumo, 3)} kWh`;
            document.getElementById('costoMes').textContent = window.Utils.formatCurrency(costo);
            document.getElementById('promedioDiario').textContent = `${window.Utils.formatNumber(promedio, 2)} kWh/día`;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ============================================
// ACTUALIZACIÓN DE UI
// ============================================

function updateEnergiaUI(data) {
    const isOld = (new Date() - new Date(data.created_at)) > 10 * 60 * 1000; // 10 minutos
    const statusEl = document.getElementById('energiaStatus');

    if (statusEl) {
        if (isOld) {
            statusEl.textContent = 'Datos antiguos';
            statusEl.classList.add('status-old');
            statusEl.style.background = 'var(--text-muted)';
        } else {
            statusEl.textContent = 'En vivo';
            statusEl.classList.remove('status-old');
            statusEl.style.background = 'var(--primary)';
        }
    }

    // Actualizar tiempo relativo en la tarjeta
    const energyTimeEl = document.getElementById('energiaTime');
    if (energyTimeEl) {
        energyTimeEl.textContent = window.Utils.formatDate(data.created_at);
    }

    // Dashboard
    document.getElementById('voltaje').textContent = `${window.Utils.formatNumber(data.voltaje, 2)} V`;
    document.getElementById('corriente').textContent = `${window.Utils.formatNumber(data.corriente, 3)} A`;
    document.getElementById('potencia').textContent = `${window.Utils.formatNumber(data.potencia, 2)} W`;
    document.getElementById('costoHoy').textContent = window.Utils.formatCurrency(data.costo_estimado);

    // Pestaña Energía
    document.getElementById('voltajeDetalle').textContent = `${window.Utils.formatNumber(data.voltaje, 2)} V`;
    document.getElementById('corrienteDetalle').textContent = `${window.Utils.formatNumber(data.corriente, 3)} A`;
    document.getElementById('potenciaDetalle').textContent = `${window.Utils.formatNumber(data.potencia, 2)} W`;
    document.getElementById('energiaAcumulada').textContent = `${window.Utils.formatNumber(data.energia_kwh, 3)} kWh`;

    // Actualizar gráfico de potencia en tiempo real
    window.Charts.updatePotenciaReal(data.potencia);

    // Actualizar timestamp
    updateLastUpdate(data.created_at);
}

function updateAguaUI(data) {
    const isOld = (new Date() - new Date(data.created_at)) > 15 * 60 * 1000; // 15 minutos para agua (suele actualizarse menos)
    const statusEl = document.getElementById('aguaStatus');

    if (statusEl) {
        if (isOld) {
            statusEl.textContent = 'Datos antiguos';
            statusEl.style.background = 'var(--text-muted)';
        } else {
            statusEl.textContent = 'En vivo';
            statusEl.style.background = 'var(--primary)';
        }
    }

    // Actualizar tiempo relativo en la tarjeta
    const aguaTimeEl = document.getElementById('aguaTime');
    if (aguaTimeEl) {
        aguaTimeEl.textContent = window.Utils.formatDate(data.created_at);
    }

    const percentage = data.nivel_porcentaje || 0;
    const nivel = data.nivel_cm || 0;
    const bateria = data.porcentaje_bateria || 0;
    const voltaje = data.voltaje_bateria || 0;

    // Dashboard - Tanque pequeño
    document.getElementById('tankFill').style.height = `${percentage}%`;
    document.getElementById('tankPercentage').textContent = `${Math.round(percentage)}%`;
    document.getElementById('nivelCm').textContent = `${window.Utils.formatNumber(nivel, 1)} cm`;
    document.getElementById('bateriaSensor').textContent = `${Math.round(bateria)}%`;

    // Pestaña Agua - Tanque grande
    const tankFillLarge = document.getElementById('tankFillLarge');
    if (tankFillLarge) {
        tankFillLarge.style.height = `${percentage}%`;
        document.getElementById('tankPercentageLarge').textContent = `${Math.round(percentage)}%`;
        document.getElementById('tankLevelLarge').textContent = `${window.Utils.formatNumber(nivel, 1)} cm`;
    }

    // Batería
    const batteryLevel = document.getElementById('batteryLevel');
    if (batteryLevel) {
        batteryLevel.style.width = `${bateria}%`;
        batteryLevel.style.background = `linear-gradient(90deg, ${window.Utils.getBatteryColor(bateria)}, var(--primary))`;
        document.getElementById('batteryPercentage').textContent = `${Math.round(bateria)}%`;
        document.getElementById('batteryVoltage').textContent = `${window.Utils.formatNumber(voltaje, 2)} V`;
    }

    updateLastUpdate(data.created_at);
}

function updateEventosUI(eventos) {
    const container = document.getElementById('eventosRecientes');

    if (!eventos || eventos.length === 0) {
        container.innerHTML = '<div class="evento-item">No hay eventos recientes</div>';
        return;
    }

    container.innerHTML = eventos.map(evento => `
        <div class="evento-item ${evento.origen}">
            <div>
                <span>${window.Utils.getEventIcon(evento.tipo)}</span>
                <strong>${evento.titulo}</strong>
                ${evento.descripcion ? `<br><small>${evento.descripcion}</small>` : ''}
            </div>
            <small>${window.Utils.formatDate(evento.created_at)}</small>
        </div>
    `).join('');
}

function updateLastUpdate(timestamp) {
    appState.lastUpdate = timestamp;
    const el = document.getElementById('lastUpdate');
    el.textContent = `Última actualización: ${window.Utils.formatDate(timestamp)}`;
}

// ============================================
// DATOS ESPECÍFICOS DE PESTAÑAS
// ============================================

async function loadEnergiaData() {
    // Cargar patrón de uso por hora (últimos 30 días)
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_energia')
            .select('created_at, potencia')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) throw error;

        if (data) {
            window.Charts.updatePatronUso(data);
        }
    } catch (error) {
        console.error('Error cargando patrón de uso:', error);
    }
}

async function loadAguaData() {
    // Cargar historial completo
    try {
        const { data, error } = await supabaseClient
            .from('lecturas_agua')
            .select('created_at, nivel_porcentaje')
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) throw error;

        if (data) {
            window.Charts.updateNivelHistorial(data);
        }
    } catch (error) {
        console.error('Error cargando historial agua:', error);
    }
}

async function loadEventosData() {
    try {
        const { data, error } = await supabaseClient
            .from('eventos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        displayEventosTable(data || []);
    } catch (error) {
        console.error('Error cargando eventos completos:', error);
    }
}

function displayEventosTable(eventos) {
    const container = document.getElementById('eventosTable');

    if (!eventos || eventos.length === 0) {
        container.innerHTML = '<div class="loading-spinner">No hay eventos registrados</div>';
        return;
    }

    const html = eventos.map(evento => `
        <div class="evento-item ${evento.origen} ${!evento.resuelto ? 'pendiente' : ''}" data-tipo="${evento.tipo}" data-origen="${evento.origen}">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-size: 1.2rem;">${window.Utils.getEventIcon(evento.tipo)}</span>
                    <strong>${evento.titulo}</strong>
                    ${!evento.resuelto ? '<span style="background: var(--danger); color: white; padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.7rem;">PENDIENTE</span>' : ''}
                </div>
                ${evento.descripcion ? `<div style="color: var(--text-muted); font-size: 0.9rem;">${evento.descripcion}</div>` : ''}
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">
                    Origen: ${evento.origen} | ${window.Utils.formatDate(evento.created_at)}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// ============================================
// CONFIGURACIÓN
// ============================================

async function loadConfiguracionData() {
    try {
        const { data, error } = await supabaseClient
            .from('configuracion')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        if (data) {
            // Llenar formularios
            // Tarifas
            document.getElementById('tarifaActiva').value = data.tarifa_activa;
            document.getElementById('tarifaInvierno').value = data.tarifa_kwh_invierno;
            document.getElementById('tarifaVerano').value = data.tarifa_kwh_verano;
            document.getElementById('cargoFijo').value = data.cargo_fijo;
            document.getElementById('cargoTransmision').value = data.cargo_transmision;
            document.getElementById('umbralPotencia').value = data.umbral_potencia_alta;

            // Tanque
            document.getElementById('tanqueAltura').value = data.tanque_altura_cm;
            document.getElementById('tanqueCapacidad').value = data.tanque_capacidad_litros;
            document.getElementById('umbralBajo').value = data.umbral_nivel_bajo;
            document.getElementById('umbralCritico').value = data.umbral_nivel_critico;

            // Avanzado
            document.getElementById('sensorOffset').value = data.jsn_sr04t_offset_cm;
            document.getElementById('intervaloEnergia').value = data.intervalo_energia;
            document.getElementById('intervaloAgua').value = data.intervalo_agua;
        }
    } catch (error) {
        console.error('Error cargando configuración:', error);
        window.Utils.showNotification('Error al cargar la configuración', 'error');
    }
}

function setupConfigForms() {
    const forms = ['formTarifas', 'formTanque', 'formSensores'];

    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await saveConfiguracion(formId);
            });
        }
    });
}

async function saveConfiguracion(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const updates = {};

    formData.forEach((value, key) => {
        // Convertir a número si es posible
        updates[key] = isNaN(value) || value === '' ? value : parseFloat(value);
    });

    try {
        const { error } = await supabaseClient
            .from('configuracion')
            .update(updates)
            .eq('id', 1);

        if (error) throw error;

        window.Utils.showNotification('Configuración guardada correctamente', 'success');
        console.log(`✅ ${formId} actualizado`);
    } catch (error) {
        console.error('Error guardando configuración:', error);
        window.Utils.showNotification('Error al guardar la configuración', 'error');
    }
}

// ============================================
// FILTROS DE EVENTOS
// ============================================

function setupEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Aplicar filtro
            const filter = button.dataset.filter;
            filterEventos(filter);
        });
    });
}

function filterEventos(filter) {
    const eventos = document.querySelectorAll('#eventosTable .evento-item');

    eventos.forEach(evento => {
        const tipo = evento.dataset.tipo;
        const origen = evento.dataset.origen;
        const isPendiente = evento.classList.contains('pendiente');

        let show = true;

        if (filter === 'energia') {
            show = origen === 'energia';
        } else if (filter === 'agua') {
            show = origen === 'agua';
        } else if (filter === 'pendiente') {
            show = isPendiente;
        }

        evento.style.display = show ? 'flex' : 'none';
    });
}

// ============================================
// ACTUALIZACIÓN AUTOMÁTICA
// ============================================

function setupAutoUpdate() {
    // Actualizar datos en tiempo real cada 5 segundos
    appState.updateIntervals.realtime = setInterval(() => {
        loadEnergiaRealtime();
        loadAguaRealtime();
    }, window.CONFIG.UPDATE_INTERVALS.realtime);

    // Actualizar gráficos cada 30 segundos
    appState.updateIntervals.charts = setInterval(() => {
        loadConsumo24h();
        loadNivelAgua7d();
    }, window.CONFIG.UPDATE_INTERVALS.charts);

    // Actualizar eventos cada 1 minuto
    appState.updateIntervals.events = setInterval(() => {
        loadEventosRecientes();
        if (appState.currentTab === 'eventos') {
            loadEventosData();
        }
    }, window.CONFIG.UPDATE_INTERVALS.events);

    console.log('✅ Actualización automática configurada');
}

// Limpiar intervalos al cerrar
window.addEventListener('beforeunload', () => {
    Object.values(appState.updateIntervals).forEach(interval => {
        clearInterval(interval);
    });
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================

window.App = {
    state: appState,
    switchTab,
    loadInitialData,
    testConnection
};

console.log('📱 App.js cargado');
