const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

// Serve your Vue app's static files
app.use(express.static(path.join(__dirname, '../client/index.html')));

app.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL parameter is missing');
  }

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url);
    // Perform web scraping tasks here
    await browser.close();
    return res.send(`Web scraping completed successfully for ${url}`);
  } catch (error) {
    console.error('Error during web scraping:', error);
    return res.status(500).send('Internal Server Error');
  }
});


app.post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
});

app.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
});

app.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
