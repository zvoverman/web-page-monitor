<template>
    <footer>
        <div id="credits">
            <p>See the documentation <a href="https://github.com/zvoverman/web-page-monitor">here</a>.</p>
        </div>
    </footer>
</template>
   
<style scoped>
footer {
    display: flex;
    text-align: center;
    align-content: center;
    justify-content: center;
    width: 100%;
    background-color: var(--dark-color);
    color: var(--light-color);
}

p {
    color: var(--light-color);
    padding: 10px;
}

a {
  color: var(--mid-color);
}

a:visited {
  color: var(--mid-color);
}
</style>