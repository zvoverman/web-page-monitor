<template>
    <div class="monitor-page">
        <div class="input-wrapper">
            <p>Enter URL:</p>
            <input v-model="url" class="input">
            <button @click="getWebsite(url)" class="btn" id="post-url-button">GO</button>
        </div>
        <div class="browser-window">
            <img :src="screenshot_url" id="browser-screenshot" alt="Screenshot">
        </div>
        <button @click="postURL(url)" class="btn" id="post-url-button">Monitor</button>
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
            screenshot_url: '',
        };
    },
    methods: {
        async getWebsite(url) {
            try {
                console.log("Grabbing website...")
                // Fetch the screenshot from backend using Axios
                const response = await axios.get('/api/screenshot/' + encodeURIComponent(url), {
                    responseType: 'blob' // Set response type to blob
                });

                console.log("Response received")

                if (response.status === 200) {
                    // Convert binary data to URL
                    const blob = response.data;
                    this.screenshot_url = URL.createObjectURL(blob);
                } else {
                    console.error('Failed to fetch screenshot');
                }
            } catch (error) {
                console.error('Error fetching screenshot:', error);
            }
        },
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
        },
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

.input,
.btn {
    background-color: var(--light-color);
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.browser-window {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 450px;  
    margin-left: 10vw;
    margin-right: 10vw;
    overflow: auto;

    background-color: var(--dark-color);

    border-style: solid;
    border-color: var(--light-color);
    border-radius: 6px;
    border-width: 10px;
}

#browser-screenshot {
    width: 100%;
    height: auto;
    /* 16:9 Aspect Ratio (9 / 16 = 0.5625) */
}
</style>