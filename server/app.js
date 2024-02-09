const express = require('express');
const cors = require('cors');
const path = require('path')
const puppeteer = require('puppeteer')

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
})

app.post('/api/monitor/:url' , (req, res) => {
  const url = decodeURIComponent(req.params.url)

  monitor(url)

  res.status(200).send("monitoring " + url)
})

async function monitor(url) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(url);

  await browser.close()

  console.log("closed browser")
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
