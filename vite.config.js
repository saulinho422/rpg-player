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
        migrateData: resolve(__dirname, 'migrate-data.html'),
        migrationRunner: resolve(__dirname, 'migration-runner.html'),
        testSupabase: resolve(__dirname, 'test-supabase.html')
      }
    }
  }
})