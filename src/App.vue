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
  --light-color: #FBFBFB;
  --secondary-light-color: #BCABAE;
  --mid-color: #716969;
  --secondary-dark-color: #2D2E2E;
  --dark-color: #0F0F0F;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: var(--secondary-dark-color);
  color: var(--light-color);
  margin-top: 60px;
  /* width: 100%;
  min-height: 100vh; */
}
</style>
