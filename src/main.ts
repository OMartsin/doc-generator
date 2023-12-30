import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueDatePicker from '@vuepic/vue-datepicker';
import './assets/base.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  },
})

app.use(vuetify)


app.use(createPinia())
app.use(router)
app.component('VueDatePicker', VueDatePicker);

app.mount('#app')
