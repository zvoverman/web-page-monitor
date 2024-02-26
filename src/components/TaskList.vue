<template>
    <div class="task-list-panel">
        <div class="task-list">
            <div v-for="url in urls" :key="url.id" class="task">
                <div>{{ url.url }}</div>
                <div class="btns">
                    <button @click="getStatus(url.id)" class="btn" id="get-status-button">GET</button>
                    <button @click="deleteURL(url.id)" class="btn" id="delete-url-button">DELETE</button>
                </div>
            </div>
        </div>
    </div>
    <div class="results-panel">
        <img v-show="currentImage === 'original'" id="original-img" :src="originalImageUrl" alt="Original">
        <img v-show="currentImage === 'new'" id="new-img" :src="newImageUrl" alt="New">
        <img v-show="currentImage === 'diff'" id="diff-img" :src="diffImageUrl" alt="Diff">
        <div id="status"></div>
        <div class="controls">
            <button @click="showImage('original')" class="img-btn" id="original-img">Original</button>
            <button @click="showImage('new')" class="img-btn" id="new-img">New</button>
            <button @click="showImage('diff')" class="img-btn" id="diff-img">Diff</button>
        </div>
    </div>
</template>

<script>
const axios = require('axios');

export default {
    name: 'MonitorPage',
    data() {
        return {
            urls: [],
            originalImageUrl: '',
            newImageUrl: '',
            diffImageUrl: '',
            currentImage: 'original' // Track the currently displayed image
        }
    },
    mounted() {
        // Make a GET request using Axios to fetch URLs from your backend API
        axios.get('/api/urls')
            .then(response => {
                // Set the fetched URLs to the urls array
                this.urls = response.data;
            })
            .catch(error => {
                console.error('Error fetching URLs:', error);
            });
    },
    methods: {
        getStatus(id) {
            axios.get('/api/monitor/' + id)
                .then(response => {
                    let responseData = response.data.result;
                    let url = response.data.url;
                    console.log('Data', responseData);
                    if (responseData.imagesAreSame) {
                        document.getElementById("status").innerHTML = "There have been NO changes to " + url;
                    } else {
                        document.getElementById("status").innerHTML = "There have been " + responseData.diffCount + " changes to " + url;
                    }
                    
                    // Set image URLs
                    this.originalImageUrl = `../../screenshots/${id}_screenshot.png`;
                    this.newImageUrl = `../../screenshots/${id}_new_screenshot.png`;
                    this.diffImageUrl = `../../screenshots/${id}_diff.png`;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        deleteURL(id) {
            axios.delete('/api/monitor/' + id)
                .then(response => {
                    console.log(response.data.message)
                })
                .catch(error => {
                    console.log(error)
                })
        },
        showImage(imageType) {
            // Update currentImage to switch between images
            this.currentImage = imageType;  
        }
    }
}
</script>

<style>
.task-list-panel {
    background-color: var(--secondary-light-color);
    margin-left: 12vw;
    margin-right: 12vw;
    margin-top: 20px;
    margin-bottom: 20px;
    border-radius: 30px;
    padding: 20px;
}

.task-list {
    height: auto;
}

.task {
    display: flex;
    justify-content: space-between; /* Adjusted alignment */
    align-items: center;
    text-align: center;
    color: var(--light-color);
    background-color: var(--secondary-dark-color);
    border-radius: 10px;
    margin: 10px;
    padding: 10px; /* Added padding for better spacing */
}

.btns {
    display: flex;
    justify-content: flex-end; /* Adjusted alignment */
}

.btn {
    background-color: var(--mid-color);
    width: auto; /* Adjusted width */
    height: auto;
    padding: 10px;
    border: solid;
    border-color: var(--mid-color);
    border-width: 2px;
    border-radius: 3px;
    margin: 5px;
}

.img-btn {
    background-color: var(--mid-color);
    padding: 10px;
    border: solid;
    border-color: var(--mid-color);
    border-width: 2px;
    border-radius: 3px;
    margin: 5px;
}

.btn:hover, .img-btn:hover {
    cursor: pointer;
}

.results-panel {
    background-color: var(--secondary-light-color);
    margin-left: 12vw;
    margin-right: 12vw;
    margin-top: 20px;
    margin-bottom: 20px;
    border-radius: 30px;
    padding: 20px;

    img {
        width: 100%;
        height: auto;
    }
}

#status {
    padding: 10px;
}

</style>