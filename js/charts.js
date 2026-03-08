// Gestión de gráficos con Chart.js

let charts = {};

// Inicializar todos los gráficos
function initCharts() {
    // Gráfico de consumo 24h
    const ctx24h = document.getElementById('chartConsumo24h');
    if (ctx24h) {
        charts.consumo24h = new Chart(ctx24h, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Potencia (W)',
                    data: [],
                    borderColor: '#00cec9',
                    backgroundColor: 'rgba(0, 206, 201, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...window.CONFIG.CHART_CONFIG,
                scales: {
                    ...window.CONFIG.CHART_CONFIG.scales,
                    y: {
                        ...window.CONFIG.CHART_CONFIG.scales.y,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Potencia (W)',
                            color: '#b2bec3'
                        }
                    }
                }
            }
        });
    }

    // Gráfico de nivel de agua
    const ctxAgua = document.getElementById('chartNivelAgua');
    if (ctxAgua) {
        charts.nivelAgua = new Chart(ctxAgua, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Nivel (%)',
                    data: [],
                    borderColor: '#0984e3',
                    backgroundColor: 'rgba(9, 132, 227, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...window.CONFIG.CHART_CONFIG,
                scales: {
                    ...window.CONFIG.CHART_CONFIG.scales,
                    y: {
                        ...window.CONFIG.CHART_CONFIG.scales.y,
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Nivel (%)',
                            color: '#b2bec3'
                        }
                    }
                }
            }
        });
    }

    // Gráfico de potencia en tiempo real
    const ctxPotencia = document.getElementById('chartPotenciaReal');
    if (ctxPotencia) {
        charts.potenciaReal = new Chart(ctxPotencia, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Potencia (W)',
                    data: [],
                    borderColor: '#fab1a0',
                    backgroundColor: 'rgba(250, 177, 160, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                ...window.CONFIG.CHART_CONFIG,
                animation: {
                    duration: 750
                }
            }
        });
    }

    // Gráfico de patrón de uso por hora
    const ctxPatron = document.getElementById('chartPatronUso');
    if (ctxPatron) {
        charts.patronUso = new Chart(ctxPatron, {
            type: 'bar',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Consumo Promedio (W)',
                    data: Array(24).fill(0),
                    backgroundColor: 'rgba(0, 206, 201, 0.6)',
                    borderColor: '#00cec9',
                    borderWidth: 1
                }]
            },
            options: {
                ...window.CONFIG.CHART_CONFIG,
                scales: {
                    ...window.CONFIG.CHART_CONFIG.scales,
                    y: {
                        ...window.CONFIG.CHART_CONFIG.scales.y,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Gráfico de historial de nivel
    const ctxHistorial = document.getElementById('chartNivelHistorial');
    if (ctxHistorial) {
        charts.nivelHistorial = new Chart(ctxHistorial, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Nivel (%)',
                    data: [],
                    borderColor: '#0984e3',
                    backgroundColor: 'rgba(9, 132, 227, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...window.CONFIG.CHART_CONFIG
            }
        });
    }
}

// Actualizar gráfico de consumo 24h
function updateConsumo24h(data) {
    if (!charts.consumo24h) return;

    const labels = data.map(item => {
        const date = new Date(item.created_at);
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    });

    const values = data.map(item => item.potencia);

    charts.consumo24h.data.labels = labels;
    charts.consumo24h.data.datasets[0].data = values;
    charts.consumo24h.update();
}

// Actualizar gráfico de nivel de agua
function updateNivelAgua(data) {
    if (!charts.nivelAgua) return;

    const labels = data.map(item => {
        const date = new Date(item.created_at);
        return date.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
    });

    const values = data.map(item => item.nivel_porcentaje);

    charts.nivelAgua.data.labels = labels;
    charts.nivelAgua.data.datasets[0].data = values;
    charts.nivelAgua.update();
}

// Actualizar gráfico de potencia en tiempo real
function updatePotenciaReal(potencia) {
    if (!charts.potenciaReal) return;

    const now = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Mantener solo los últimos 20 puntos
    if (charts.potenciaReal.data.labels.length > 20) {
        charts.potenciaReal.data.labels.shift();
        charts.potenciaReal.data.datasets[0].data.shift();
    }

    charts.potenciaReal.data.labels.push(now);
    charts.potenciaReal.data.datasets[0].data.push(potencia);
    charts.potenciaReal.update();
}

// Actualizar patrón de uso por hora
function updatePatronUso(data) {
    if (!charts.patronUso) return;

    // Agrupar por hora
    const hourlyData = Array(24).fill(0);
    const hourlyCounts = Array(24).fill(0);

    data.forEach(item => {
        const hour = new Date(item.created_at).getHours();
        hourlyData[hour] += item.potencia;
        hourlyCounts[hour]++;
    });

    // Calcular promedio
    const averages = hourlyData.map((sum, i) =>
        hourlyCounts[i] > 0 ? sum / hourlyCounts[i] : 0
    );

    charts.patronUso.data.datasets[0].data = averages;
    charts.patronUso.update();
}

// Actualizar historial de nivel
function updateNivelHistorial(data) {
    if (!charts.nivelHistorial) return;

    const labels = data.map(item => {
        const date = new Date(item.created_at);
        return date.toLocaleString('es-CL', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    });

    const values = data.map(item => item.nivel_porcentaje);

    charts.nivelHistorial.data.labels = labels;
    charts.nivelHistorial.data.datasets[0].data = values;
    charts.nivelHistorial.update();
}

// Exportar funciones
window.Charts = {
    init: initCharts,
    updateConsumo24h,
    updateNivelAgua,
    updatePotenciaReal,
    updatePatronUso,
    updateNivelHistorial
};
