import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Supabase panelinin hazır kod örneği değişkenleri NEXT_PUBLIC_ önekiyle verir; ikisi de okunur
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Kayıt main.jsx'te elle yapılır: Android uygulamasında servis çalışanı olmamalı
      injectRegister: null,
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
