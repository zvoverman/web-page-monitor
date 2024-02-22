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
  --light-color: #fffcf2;
  --secondary-light-color: #ccc5b9;
  --mid-color: #eb5e28;
  --secondary-dark-color: #403d39;
  --dark-color: #252422;
}

body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: "Roboto Slab", serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: var(--light-color);
  color: var(--dark-color);
}
</style>
