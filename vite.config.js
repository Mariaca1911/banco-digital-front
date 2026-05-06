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
          '/api': {
            target: 'https://gateway-982674607718.us-central1.run.app',
            changeOrigin: true,
            secure: true,
          }
        }
      })
    }
  }
})