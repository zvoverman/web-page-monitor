import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faMagnifyingGlassArrowRight } from '@fortawesome/free-solid-svg-icons'
import App from './App.vue'

// Add the icon to the library
library.add(faMagnifyingGlassArrowRight)

// Create the Vue app
const app = createApp(App)
// Register the FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Mount the app
app.mount('#app')