<template>
    <div class="monitor-page">
        <div class="url-input-wrapper">
            <p>Enter URL:</p>
            <input v-model="url" id="url-input">
            <button @click="postURL(url)" class="btn" id="url-input-button">POST</button>
        </div>
        <div class="get-status">
            <p>Get page status (enter id#):</p>
            <input v-model="id" id="id-input">
            <button @click="getStatus(id)" class="btn" id="get-status-button">GET</button>
        </div>
    </div>
</template>

<script>
const axios = require('axios');

export default {
    name: 'MonitorPage',
    data() {
        return {
            url: '',
            id: '',
        };
    },
    methods: {
        // On URL button clicked
        postURL(url) {
            if (url && url != '') {
                axios.post('/api/monitor/' + encodeURIComponent(url))
                    .then(function (response) {
                        let task_id = response.data.id
                        console.log("task_id: " + task_id)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });



            } else {
                console.log("no url provided")
            }
        },
        getStatus(id) {
            axios.get('/api/monitor/' + id)
                .then(function (response) {
                    console.log("url: " + response.data.url)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    },
}
</script>

<style scoped>
.url-input-wrapper {
    display: flex;
    text-align: center;
    justify-content: center;

    padding: 10px;
}
</style>