import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDemoMode = env.VITE_DEMO_MODE === 'true'
 
  console.log('🔧 DEMO_MODE:', isDemoMode)
 
  return {
    plugins: [react()],
    server: {
      port: 3000,
      ...(isDemoMode ? {} : {
        proxy: {
          '/api/v1/auth': {
            target: 'http://localhost:8081',
            changeOrigin: true,
          },
          '/api/v1/clientes': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/api/v1/cuentas': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/api/v1/transacciones': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/api/v1/transferencias': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/api/v1/reportes': {
            target: 'http://localhost:8083',
            changeOrigin: true,
          },
        }
      })
    }
  }
})