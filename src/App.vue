<template>
  <div class="app-container">
    <AppHeader />
    <MonitorPage />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import MonitorPage from './components/MonitorPage.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    MonitorPage
  }
}
</script>

<style>
:root {
  --light-color: #D8D8F6;
  --secondary-light-color: #B18FCF;
  --mid-color: #978897;
  --secondary-dark-color: #494850;
  --dark-color: #2C2C34;
}

body {
  padding:0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: var(--light-color);
  color: var(--dark-color);
}
</style>
