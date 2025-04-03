import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: '.dark-mode',
                cssLayer: false
            }
        }
    })
    .mount('#app')
