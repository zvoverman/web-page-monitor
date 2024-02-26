<template>
    <div class="monitor-page">
        <div class="input-wrapper">
            <p>Enter URL:</p>
            <input v-model="url" class="input" placeholder="www.example.com">
            <button @click="getWebsite(url)" class="btn" id="post-url-button">GO</button>
        </div>
        <div class="browser-window-margins">
            <div class="browser-window-container">
                <div class="browser-window">
                    <VuePictureCropper :boxStyle="{
                        width: '100%',
                        height: 'auto',
                        backgroundColor: '#f8f8f8',
                        margin: '0',
                    }" :img="screenshot_url" :options="{
    viewMode: 1,
    dragMode: 'crop',
    movable: false,
    zoomable: false,
    autoCrop: false,
}" @ready="ready" />
                </div>
            </div>
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
        <img id="get-screenshot" />
        <div id="status"></div>
    </div>
</template>

<script>
import VuePictureCropper, { cropper } from 'vue-picture-cropper'

const axios = require('axios');

export default {
    name: 'MonitorPage',
    components: {
        VuePictureCropper,
    },
    data() {
        return {
            url: '',
            get_id: '',
            delete_id: '',
            screenshot_url: '',
        }
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
        async postURL(url) {
            if (url && url != '') {
                let crop_data = cropper.getData(true); // true - round data values
                let crop_blob = await cropper.getBlob();
                console.log("Crop Blob", crop_blob);

                const data = {
                    url: url,
                    crop_blob: crop_blob,
                    data: crop_data,
                };

                // Make a POST request to the API endpoint
                axios.post('/api/monitor', data)
                    .then(response => {
                        // Handle success
                        console.log('Task ID:', response.data.id);
                    })
                    .catch(error => {
                        // Handle error
                        console.error('Error:', error);
                    })
            } else {
                console.log("no url provided");
            }
        },
        getStatus(id) {
            axios.get('/api/monitor/' + id)
                .then(function (response) {
                    let responseData = response.data.result;
                    let url = response.data.url;
                    console.log('Data', responseData);
                    if (responseData.imagesAreSame) {
                        document.getElementById("status").innerHTML = "There have been NO changes to " + url;
                    } else {
                        document.getElementById("status").innerHTML = "There have been " + responseData.diffCount + " changes to " + url;
                    }

                })
                .catch(function (error) {
                    console.log(error);
                });
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

    p {
        padding-top: 5px;
    }
}

.input {
    background-color: var(--light-color);
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;

    border: solid;
    border-width: 1px;
    border-radius: 3px;
}

.btn {
    background-color: var(--secondary-light-color);
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;

    border: solid;
    border-width: 1px;
    border-radius: 3px;

    padding: 10px;
}

.btn:hover {
    cursor: pointer;
    opacity: 0.8;
}

.browser-window-margins {
    margin-left: 20vw;
    margin-right: 20vw;
}

.browser-window-container {
    position: relative;
    overflow: auto;
    width: 100%;
    /* Set padding top to achieve 16:9 ratio */
    padding-top: 56.25%;

    background-color: var(--secondary-dark-color);

    border-style: solid;
    border-color: var(--secondary-light-color);
    border-radius: 6px;
    border-width: 10px;
}

.browser-window {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#browser-screenshot {
    width: 100%;
    height: auto;
}

#status {
    padding: 50px;
}

img {
    width: 100%;
    height: 100%;
}
</style>