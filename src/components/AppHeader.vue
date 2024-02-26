<template>
    <div class="navbar-container">
        <div class="title">
            <font-awesome-icon class="icon" icon="magnifying-glass-arrow-right" />
            <h1>Web Page Monitor</h1>
        </div>
        <!-- <div class="navbar-btns">
            <button class="btn">List of Tasks</button>
        </div> -->
    </div>
</template>

<script>
export default {
    name: 'AppHeader',
}
</script>

<style scoped>
.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: var(--secondary-light-color);
}

.title {
    display: flex;
    align-items: center;
}

.navbar-btns {
    padding-right: 50px;
}

.icon {
    width: 35px;
    height: 100%;
    padding: 12px;
    color: var(--dark-color);
}

button {
    width: 100%;
    margin-right: 20px;
}
</style>
