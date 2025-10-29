import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        onboarding: resolve(__dirname, 'onboarding.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        aguarde: resolve(__dirname, 'aguarde-confirmacao.html'),
        characterSheet: resolve(__dirname, 'character-sheet.html'),
        attributeMethod: resolve(__dirname, 'attribute-method.html'),
        roll4d6: resolve(__dirname, 'roll-4d6.html'),
        distributeAttributes: resolve(__dirname, 'distribute-attributes.html'),
        testSupabase: resolve(__dirname, 'test-supabase.html')
      }
    }
  }
})