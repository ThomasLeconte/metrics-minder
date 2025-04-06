import Aura from '@primeuix/themes/aura';
import tailwindcss from "@tailwindcss/vite";
import {SystemMetrics} from "./server/system-metrics";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  hooks: {
    ready: (ctx) => {
        SystemMetrics.getInstance();
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@primevue/nuxt-module', '@nuxt/icon'],
  primevue: {
    components: {
      include: ['Chart']
    },
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-modes',
          cssLayer: false
        }
      }
    }
  }
})
