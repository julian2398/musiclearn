# 🎵 MusicLearn — Guía de instalación en Mac

Plataforma e-learning para clases de guitarra, bajo, piano y técnica vocal en Bogotá.

---

## Requisitos

- macOS 12+
- Node.js 18+ (ya lo tienes ✅)
- npm (viene incluido con Node.js ✅)

Verifica tu versión de Node con:
```bash
node --version   # debe mostrar v18.x.x o superior
npm --version
```

---

## Instalación paso a paso

### 1. Abrir el proyecto en VS Code

1. Descomprime el archivo `musiclearn.zip`
2. Abre VS Code
3. `Archivo → Abrir carpeta` → selecciona la carpeta `musiclearn`

O desde Terminal:
```bash
cd ~/Downloads/musiclearn
code .
```

---

### 2. Abrir la terminal integrada de VS Code

`Ctrl + ñ` o desde el menú: `Terminal → Nueva terminal`

---

### 3. Instalar dependencias del frontend

```bash
cd client
npm install
```

Espera que termine (puede tardar 1-2 minutos la primera vez).

---

### 4. Instalar dependencias del backend

```bash
cd ../server
npm install
```

---

### 5. Correr el proyecto

Necesitas **dos terminales abiertas al mismo tiempo**.

**Terminal 1 — Backend (puerto 5000):**
```bash
cd server
npm run dev
```
Debes ver: `🎵 MusicLearn server running on port 5000`

**Terminal 2 — Frontend (puerto 3000):**
```bash
cd client
npm run dev
```
Debes ver: `Local: http://localhost:3000/`

---

### 6. Abrir en el navegador

```
http://localhost:3000
```

¡Listo! Verás la landing page de MusicLearn.

---

## Cuentas de prueba

Una vez en la app, regístrate normalmente. O usa estas si tienes MySQL configurado:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `profesor@musiclearn.co` | `musiclearn123` | Profesor |
| `laura@email.com` | `musiclearn123` | Estudiante |

---

## Flujo de prueba recomendado

1. Ir a `http://localhost:3000` → ver landing page
2. Clic en **"Reserva tu clase"** → ir a registro
3. Crear cuenta como **Estudiante**
4. Completar el **onboarding** (7 pasos gamificados)
5. Explorar el **Portal del estudiante** con checklist y progreso
6. Crear otra cuenta como **Profesor** y ver el **Dashboard**
7. Probar el **Chat** entre los dos usuarios
8. Generar un **Reporte PDF** desde el dashboard del profesor

---

## Estructura del proyecto

```
musiclearn/
├── client/          ← React + Vite (frontend)
│   └── src/
│       ├── pages/       ← Landing, Login, Onboarding, Dashboard, Portal
│       ├── components/  ← Sidebar, Chat, Shared UI
│       ├── services/    ← API, Socket, Analytics, PDF
│       └── context/     ← Auth, Notificaciones
│
├── server/          ← Node.js + Express (backend)
│   └── src/
│       ├── routes/      ← auth, courses, progress, sessions, chat, reports
│       ├── controllers/ ← lógica de negocio
│       ├── middleware/  ← JWT auth, roles
│       └── services/    ← Socket.io, PDF (Puppeteer)
│
└── database/
    └── schema.sql   ← Esquema MySQL + datos de prueba
```

---

## MySQL (opcional)

El backend **funciona sin MySQL** en modo mock.
Si quieres conectar la base de datos real:

1. Instala MySQL: `brew install mysql` y `brew services start mysql`
2. Crea la base: `mysql -u root < database/schema.sql`
3. Edita `server/.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=musiclearn
   ```

---

## Google Analytics

Reemplaza el ID en `client/index.html`:
```html
<script async src="...?id=G-TU_ID_REAL"></script>
gtag('config', 'G-TU_ID_REAL');
```

---

## Problemas comunes en Mac

**`npm install` falla con errores de permisos:**
```bash
sudo chown -R $USER ~/.npm
```

**Puerto 3000 ya en uso:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Puerto 5000 ya en uso (AirPlay usa el 5000 en Mac):**
Cambia en `server/.env`: `PORT=5001`
Y en `client/vite.config.js` actualiza el proxy a `http://localhost:5001`

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Estilos | CSS Variables (sistema de diseño propio) |
| Backend | Node.js, Express, Socket.io |
| Auth | JWT + bcrypt |
| PDF | jsPDF + jspdf-autotable (cliente) |
| Analytics | Google Analytics 4 |
| BD | MySQL / modo mock en memoria |
| Chat | Socket.io en tiempo real |
