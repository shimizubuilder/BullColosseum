import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setupPersistence } from '@/stores/plugins/persistence'
import { bootstrap } from '@/app/bootstrap'
import '@/styles/base.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
setupPersistence()
void bootstrap()
