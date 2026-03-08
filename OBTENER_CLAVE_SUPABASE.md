# 🔑 Cómo Obtener la Clave Anónima de Supabase

## Problema Actual
La interfaz web muestra error **401 Unauthorized** porque la clave API no es válida.

## Solución

### Paso 1: Ir a Supabase Dashboard
Abre tu navegador y ve a:
```
https://supabase.com/dashboard/project/vlccxzzbfuammgyxzogb
```

### Paso 2: Ir a Settings → API
1. En el menú lateral, haz clic en **Settings** (⚙️)
2. Luego haz clic en **API**

### Paso 3: Copiar la Clave Anónima
Busca la sección **Project API keys** y copia la clave que dice:
- **`anon` `public`** 

La clave debe empezar con `eyJ...` y es muy larga (como 200+ caracteres).

**Ejemplo de cómo se ve:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY2N4enpiZnVhbW1neXh6b2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0OTg0NTcsImV4cCI6MjA1MzA3NDQ1N30.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Paso 4: Pegar en el Archivo de Configuración

1. Abre el archivo: `d:\Electrosun\monitor-web\js\config.js`
2. Busca la línea:
   ```javascript
   const SUPABASE_ANON_KEY = 'REEMPLAZAR_CON_TU_CLAVE_ANON';
   ```
3. Reemplaza `'REEMPLAZAR_CON_TU_CLAVE_ANON'` con tu clave real entre comillas simples:
   ```javascript
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
4. Guarda el archivo (Ctrl + S)

### Paso 5: Recargar la Página
1. Ve a tu navegador donde está abierto http://localhost:8000
2. Presiona **Ctrl + Shift + R** (recarga forzada)
3. La interfaz debería conectarse correctamente

## ✅ Verificación
Si todo está correcto, deberías ver:
- Indicador de conexión en **verde** que dice "Conectado"
- Datos de energía y agua cargándose
- Sin errores 401 en la consola

## ⚠️ Nota de Seguridad
La clave `anon` es segura para usar en el frontend porque:
- Solo permite operaciones definidas en las políticas RLS de Supabase
- No tiene permisos administrativos
- Es la clave diseñada para aplicaciones públicas

---

**¿Necesitas ayuda?** Compárteme la clave y yo la actualizo en el archivo por ti.
