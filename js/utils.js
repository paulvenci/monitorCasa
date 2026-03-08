// Utilidades generales

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Si es menos de 1 minuto
    if (diff < 60000) {
        return 'Hace un momento';
    }

    // Si es menos de 1 hora
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `Hace ${minutes} min`;
    }

    // Si es menos de 24 horas
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `Hace ${hours}h`;
    }

    // Si es menos de 7 días
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `Hace ${days} días`;
    }

    // Formato completo
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formatear números
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) {
        return '--';
    }
    return Number(num).toFixed(decimals);
}

// Formatear moneda CLP
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$-- CLP';
    }
    return `$${Math.round(amount).toLocaleString('es-CL')} CLP`;
}

// Obtener color según nivel de batería
function getBatteryColor(percentage) {
    if (percentage > 60) return '#00b894';
    if (percentage > 30) return '#fdcb6e';
    return '#d63031';
}

// Obtener color según nivel de agua
function getWaterLevelColor(percentage) {
    if (percentage > 50) return '#00cec9';
    if (percentage > 20) return '#fdcb6e';
    return '#d63031';
}

// Obtener icono según tipo de evento
function getEventIcon(tipo) {
    const icons = {
        'corte_luz': '⚠️',
        'restauracion_luz': '✅',
        'consumo_alto': '📈',
        'nivel_bajo': '💧',
        'nivel_critico': '🚨',
        'bateria_baja': '🔋'
    };
    return icons[tipo] || '📌';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Aquí se puede agregar un sistema de notificaciones toast
}

// Exportar utilidades
window.Utils = {
    formatDate,
    formatNumber,
    formatCurrency,
    getBatteryColor,
    getWaterLevelColor,
    getEventIcon,
    debounce,
    showNotification
};
