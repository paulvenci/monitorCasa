# Electrosun - Monitor Web

Interfaz web para visualizar datos de sensores ESP32 (consumo eléctrico y nivel de agua) almacenados en Supabase.

## 🚀 Características

- ✅ **Dashboard en tiempo real** con métricas de energía y agua
- ✅ **Gráficos interactivos** con Chart.js
- ✅ **Diseño moderno** con tema oscuro y animaciones
- ✅ **Responsive** - funciona en móvil, tablet y desktop
- ✅ **Actualización automática** cada 5 segundos
- ✅ **Sin frameworks** - HTML, CSS y JavaScript vanilla

## 📁 Estructura del Proyecto

```
monitor-web/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos
├── js/
│   ├── config.js       # Configuración Supabase
│   ├── app.js          # Lógica principal
│   ├── charts.js       # Gráficos
│   └── utils.js        # Utilidades
└── assets/             # Recursos adicionales
```

## 🔧 Instalación

### Opción 1: Servidor Local Simple

1. Abre una terminal en la carpeta `monitor-web`
2. Ejecuta un servidor HTTP local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes npx)
npx http-server -p 8000
```

3. Abre tu navegador en `http://localhost:8000`

### Opción 2: Abrir Directamente

Simplemente abre el archivo `index.html` en tu navegador.

> ⚠️ **Nota:** Algunos navegadores pueden bloquear las peticiones a Supabase por CORS si abres el archivo directamente. Se recomienda usar un servidor local.

## 🌐 Deployment

### Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Desde la carpeta `monitor-web`:
```bash
vercel
```

3. Sigue las instrucciones en pantalla

### Netlify

1. Arrastra la carpeta `monitor-web` a [netlify.com/drop](https://app.netlify.com/drop)
2. ¡Listo!

### GitHub Pages

1. Sube el contenido de `monitor-web` a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama y carpeta
4. Guarda y espera el deployment

## 📊 Secciones

### Dashboard
- Métricas en tiempo real de energía y agua
- Gráficos de consumo últimas 24h
- Nivel de agua últimos 7 días
- Eventos recientes
- Estadísticas del mes

### Energía
- Mediciones detalladas (voltaje, corriente, potencia)
- Gráfico de potencia en tiempo real
- Patrón de uso por hora del día

### Agua
- Visualización del tanque con nivel actual
- Estado de batería del sensor
- Historial completo de mediciones

### Eventos
- Registro de todos los eventos
- Filtros por tipo (energía, agua, pendientes)
- Marcado de eventos resueltos

## ⚙️ Configuración

### Credenciales de Supabase

Las credenciales ya están configuradas en `js/config.js`:

```javascript
const SUPABASE_URL = 'https://vlccxzzbfuammgyxzogb.supabase.co';
const SUPABASE_ANON_KEY = 'tu_clave_anonima';
```

### Intervalos de Actualización

Puedes modificar los intervalos en `js/config.js`:

```javascript
const UPDATE_INTERVALS = {
    realtime: 5000,      // 5 segundos
    charts: 30000,       // 30 segundos
    events: 60000        // 1 minuto
};
```

## 🎨 Personalización

### Colores

Edita las variables CSS en `css/styles.css`:

```css
:root {
    --primary: #00cec9;
    --secondary: #0984e3;
    --accent: #fab1a0;
    /* ... más colores */
}
```

### Gráficos

Modifica la configuración en `js/charts.js` para cambiar estilos, colores y comportamiento de los gráficos.

## 📱 Características Técnicas

- **Supabase JS Client** v2 para conexión a base de datos
- **Chart.js** v4 para gráficos interactivos
- **CSS Grid** y **Flexbox** para layout responsive
- **CSS Variables** para temas personalizables
- **Vanilla JavaScript** - sin dependencias pesadas

## 🔒 Seguridad

> ⚠️ **Importante:** La clave anónima de Supabase está visible en el código. Asegúrate de:
> 
> 1. Configurar **Row Level Security (RLS)** en Supabase
> 2. Limitar permisos de la clave anónima
> 3. No exponer datos sensibles

## 🐛 Troubleshooting

### No se muestran datos

1. Verifica que los ESP32 estén enviando datos a Supabase
2. Abre la consola del navegador (F12) para ver errores
3. Verifica las credenciales de Supabase en `config.js`

### Error de CORS

- Usa un servidor HTTP local en lugar de abrir el archivo directamente
- Verifica la configuración de CORS en Supabase

### Gráficos no se cargan

- Verifica que Chart.js se cargue correctamente
- Revisa la consola del navegador para errores

## 📝 Próximas Mejoras

- [ ] Sistema de notificaciones push
- [ ] Exportar datos a CSV/Excel
- [ ] Modo oscuro/claro toggle
- [ ] PWA para instalación en móvil
- [ ] Configuración remota de sensores
- [ ] Alertas personalizables

## 📄 Licencia

Este proyecto es de uso personal para el sistema de monitoreo Electrosun.

## 🤝 Soporte

Para problemas o sugerencias, revisa los logs en la consola del navegador o verifica la conexión a Supabase.

---

**Versión:** 1.0  
**Última actualización:** Febrero 2026
