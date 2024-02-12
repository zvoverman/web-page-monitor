const express = require('express');
const cors = require('cors');
const path = require('path')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

const map = new Map();
let id = 0;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the '/client/screenshots' directory
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/index.html'))
})

app.get('/api/monitor/:id', (req, res) => {
	const task_id = req.params.id

	monitor(task_id)

	res.status(200).send("GET request made successfully")

});

app.post('/api/monitor/:url', (req, res) => {

	// Retrieve URL from request parameters
	const url = decodeURIComponent(req.params.url)

	// Fetch page content from URL
	let page_content
	axios.get(url)
		.then(function (response) {
			page_content = response
		})
		.catch(function (error) {
			console.error(error);
		});

	// Store url with key: id
	map.set(id, url)
	monitor(id)
	res.status(200).json({ id: id })
	id++
})

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});


// Monitor web page on POST request
async function monitor(id) {
	let url = map.get(id)

	// Launch the browser and open a new blank page
	let browser
	try {
		browser = await puppeteer.launch({
			executablePath: '/usr/bin/google-chrome-stable', // Path to installed Chrome executable
			headless: true,
			args: ['--no-sandbox', '--disable-dev-shm-usage']
		});
	} catch (err) {
		console.log("Developing outside container, using puppeteer chrome")
		browser = await puppeteer.launch();
	}

	const page = await browser.newPage();

	// Set the viewport's width and height
	await page.setViewport({ width: 1920, height: 1080 });

	// Navigate the page to a URL
	await page.goto(url);

	try {
		// Capture screenshot and save it in the current folder:
		await page.screenshot({ path: path.join(__dirname, '../client/screenshots/screenshot_' + id + '.jpg') });

	} catch (err) {
		console.log(`Error: ${err.message}`);
	} finally {
		await browser.close();
		console.log(`Screenshot has been captured successfully`);
	}

	await browser.close()
}
