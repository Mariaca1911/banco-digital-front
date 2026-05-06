# Banco Digital — Frontend

React + Vite frontend para el sistema bancario digital.

## Stack
- React 18 + React Router v6
- Vite 5
- CSS custom (sin dependencias de UI)
- Desplegado en Vercel

## Variables de entorno

Crea un archivo `.env` en la raíz (o configúralo en Vercel):

```
VITE_API_BASE_URL=https://gateway-982674607718.us-central1.run.app
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Despliegue en Vercel

### Opción 1 — Vercel CLI
```bash
npm i -g vercel
vercel
```
Cuando pregunte:
- **Framework**: Vite
- **Build command**: `npm run build`
- **Output dir**: `dist`

### Opción 2 — Dashboard de Vercel
1. Sube el proyecto a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. En **Environment Variables**, agrega:
   - `VITE_API_BASE_URL` = `https://gateway-982674607718.us-central1.run.app`
4. Deploy ✓

El archivo `vercel.json` ya está configurado para SPA routing.

## Estructura de rutas

| Ruta | Roles | HU |
|------|-------|----|
| `/login` | Público | HU-11 |
| `/clientes` | ADMIN, CAJERO | — |
| `/clientes/nuevo` | ADMIN, CAJERO | HU-01 |
| `/clientes/:id` | ADMIN, CAJERO | HU-02, HU-03, HU-04 |
| `/cuentas/nueva` | ADMIN, CAJERO | HU-04 |
| `/mi-perfil` | CLIENTE | HU-02, HU-03 |
| `/mis-cuentas` | CLIENTE | HU-06 |
| `/operaciones` | CLIENTE | HU-07, HU-08, HU-09 |
| `/reportes` | CLIENTE | HU-10 |

## Notas
- El login redirige automáticamente por rol: CLIENTE → `/mis-cuentas`, ADMIN/CAJERO → `/clientes`
- El token JWT se guarda en `localStorage` y se inyecta en cada request vía el cliente HTTP
- Si el token expira (401), se hace logout automático y redirige a `/login`
