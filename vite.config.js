import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Turnike: Sözcük Seferi',
        short_name: 'Turnike',
        description: 'İstanbul toplu taşıma temalı kelime bulmaca oyunu',
        theme_color: '#051424',
        background_color: '#051424',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
