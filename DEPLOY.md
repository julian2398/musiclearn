# 🚀 Guía de Deploy — MusicLearn en internet (Mac)

Tiempo estimado: 20-30 minutos. Gratis.

---

## PASO 1 — Subir el código a GitHub

### 1a. Instalar Git (si no lo tienes)
```bash
git --version
# Si no está instalado, Mac te pedirá instalarlo automáticamente
```

### 1b. Crear cuenta en GitHub
Ve a https://github.com y crea una cuenta gratis.

### 1c. Subir el proyecto
Abre la terminal en VS Code dentro de la carpeta `musiclearn` y ejecuta:

```bash
git init
git add .
git commit -m "MusicLearn plataforma inicial"
```

Luego en GitHub.com:
1. Clic en **"New repository"**
2. Nombre: `musiclearn`
3. Clic en **"Create repository"**
4. Copia los comandos que GitHub te muestra (sección "push an existing repository") y pégalos en tu terminal

---

## PASO 2 — Deploy del Frontend en Vercel (gratis)

1. Ve a https://vercel.com y regístrate con tu cuenta GitHub
2. Clic en **"Add New Project"**
3. Importa tu repositorio `musiclearn`
4. En la configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clic en **Deploy**

✅ En 2 minutos tendrás una URL como: `musiclearn.vercel.app`

---

## PASO 3 — Deploy del Backend en Render (gratis)

1. Ve a https://render.com y regístrate con GitHub
2. Clic en **"New Web Service"**
3. Conecta tu repositorio `musiclearn`
4. Configuración:
   - **Name**: `musiclearn-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/app.js`
5. En **Environment Variables** agrega:
   ```
   JWT_SECRET = musiclearn_secret_bogota_2025
   CLIENT_URL = https://musiclearn.vercel.app
   PORT = 5000
   ```
6. Clic en **Create Web Service**

✅ URL del backend: `musiclearn-api.onrender.com`

---

## PASO 4 — Conectar frontend con backend en producción

Crea el archivo `client/.env.production`:
```
VITE_API_URL=https://musiclearn-api.onrender.com
```

Y actualiza `client/src/services/api.js` (línea baseURL):
```javascript
baseURL: import.meta.env.VITE_API_URL || '/api',
```

Luego haz commit y push — Vercel redeploya automáticamente.

---

## PASO 5 — Compartir con tus 20 usuarios

Una vez desplegado, comparte este link con tus usuarios de prueba:

```
https://musiclearn.vercel.app
```

Pídeles que:
1. Vayan a la URL desde su celular o computador
2. Hagan clic en "Reserva tu clase"
3. Se registren y completen (o abandonen) el onboarding
4. Sus datos quedarán guardados automáticamente

---

## PASO 6 — Ver los resultados de investigación

Tú (el investigador) puedes ver todos los datos en:

```
https://musiclearn.vercel.app/research
```

Ahí encontrarás:
- Tasa de conversión del onboarding
- Abandono por paso
- Tiempo promedio por paso
- Embudo de conversión
- Respuestas encuesta interceptada
- Comentarios Thinking Aloud
- NPS y comentarios finales
- Botón para exportar todo en JSON

---

## ⚠️ Nota importante sobre los datos

Los datos de investigación se guardan en el **localStorage del navegador de cada usuario**.
Esto significa:
- Funcionan perfectamente para la prueba de 20 usuarios
- Para ver los datos de TODOS los usuarios desde un solo lugar, necesitarás que cada usuario te envíe su JSON (botón "Exportar") O configurar Firebase como base de datos (te ayudo con eso si lo necesitas)

Para la prueba académica con 20 usuarios, la opción más simple es:
1. Cada usuario completa el onboarding
2. Al final van a `/research` en su propio navegador
3. Hacen clic en "Exportar JSON" y te envían el archivo
4. Tú consolidas todos los JSON para el análisis

---

## Solución rápida para ver datos centralizados

Si quieres ver datos de todos los usuarios en tiempo real sin configuración extra, usa **Google Forms** complementario:

Crea un formulario con las mismas preguntas de la encuesta interceptada y comparte el link al final del onboarding. Los datos van directamente a Google Sheets.

---

## Resumen de URLs finales

| URL | Descripción |
|-----|-------------|
| `musiclearn.vercel.app` | Landing page pública |
| `musiclearn.vercel.app/register` | Registro de usuarios |
| `musiclearn.vercel.app/onboarding` | Flujo a estudiar |
| `musiclearn.vercel.app/research` | Dashboard de investigación |
