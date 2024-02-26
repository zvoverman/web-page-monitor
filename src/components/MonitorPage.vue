<template>
    <div class="monitor-page">
        <div class="monitor-panel">
            <div class="input-wrapper">
                <input v-model="url" class="input" placeholder="Enter a website: www.example.com">
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
    viewMode: 2,
    dragMode: 'crop',
    movable: false,
    zoomable: false,
    autoCrop: false,
}" />
                    </div>
                </div>
            </div>
            <button @click="postURL(url)" class="btn" id="post-url-button">Monitor for FREE</button>
        </div>
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
    },
}
</script>

<style scoped>
.monitor-panel {
    background-color: var(--secondary-light-color);
    margin-left: 12vw;
    margin-right: 12vw;
    margin-top: 20px;
    margin-bottom: 20px;
    border-radius: 30px;
}

.browser-window-margins {
    margin-left: 5vw;
    margin-right: 5vw;
}

.browser-window-container {
    position: relative;
    overflow: auto;
    width: 100%;
    /* Set padding top to achieve 16:9 ratio */
    padding-top: 56.25%;

    background-color: var(--secondary-dark-color);

    border-style: solid;
    border-color: var(--dark-color);
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
.input-wrapper {
    display: flex;
    text-align: center;
    justify-content: center;

    padding: 10px;

    margin-left: 5vw;
    margin-right: 5vw;

    p {
        padding-top: 5px;
    }
}

.input {
    text-align: center;
    background-color: var(--light-color);
    margin-top: 12px;
    margin-bottom: 12px;

    padding: 10px;

    width: 100%;

    border: solid;
    border-width: 2px;
    border-radius: 3px;
}

.btn {
    background-color: var(--mid-color);
    margin-left: 10px;
    margin-top: 12px;
    margin-bottom: 12px;

    padding: 10px;

    width: 25%;

    border: solid;
    border-color: var(--mid-color);
    border-width: 2px;
    border-radius: 3px;
}

.btn:hover {
    cursor: pointer;
}

.input:hover {
    border-color: var(--mid-color);
}

img {
    width: 100%;
    height: 100%;
}
</style>