<template>
    <div class="app-container">
        <AppHeader />
        <MonitorPage />
        <TaskList />
        <AppFooter />
    </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import MonitorPage from './components/MonitorPage.vue';
import TaskList from './components/TaskList.vue';

export default {
    name: 'App',
    components: {
        AppHeader,
        AppFooter,
        MonitorPage,
        TaskList,
    }
}
</script>

<style>
:root {
    --light-color: #fffcf2;
    --secondary-light-color: #ccc5b9;
    --mid-color: #eb5e28;
    --mid-secondary-color: #eb5f28bd;
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
