<<<<<<< Header-Footer
import 'mdb-vue-ui-kit/css/mdb.min.css';
=======
import 'bootstrap/dist/css/bootstrap.min.css'
>>>>>>> main

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
