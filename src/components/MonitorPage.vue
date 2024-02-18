<template>
    <div class="monitor-page">
        <div class="input-wrapper">
            <p>Enter URL:</p>
            <input v-model="url" class="input">
            <button @click="postURL(url)" class="btn" id="post-url-button">POST</button>
        </div>
        <div class="input-wrapper">
            <p>Get page status (enter id#):</p>
            <input v-model="get_id" class="input">
            <button @click="getStatus(get_id)" class="btn" id="get-status-button">GET</button>
        </div>
        <div class="input-wrapper">
            <p>Stop monitoring page (enter id#):</p>
            <input v-model="delete_id" class="input">
            <button @click="deleteURL(delete_id)" class="btn" id="delete-url-button">DELETE</button>
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
            get_id: '',
            delete_id: '',
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
                    console.log(response.data.message)
                })
                .catch(function (error) {
                    console.log(error)
                })
        },
        deleteURL(id) {
            axios.delete('/api/monitor/' + id)
                .then(function (response) {
                    console.log(response.data.message)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    },
}
</script>

<style scoped>
.input-wrapper {
    display: flex;
    text-align: center;
    justify-content: center;

    padding: 10px;
}

.input, .btn {
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>