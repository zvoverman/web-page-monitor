const express = require('express');
const cors = require('cors');
const path = require('path')
const axios = require('axios')
const sqlite3 = require('sqlite3').verbose();

// Screenshot
const puppeteer = require('puppeteer')
const merge = require("merge-img");
const Jimp = require("jimp");

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('@vue/cli-service/webpack.config.js');

const app = express();
app.use(cors());

// HMR Webpack Middleware
const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the '/client/screenshots' directory
app.use(express.static(path.join(__dirname, '/dist')));

const port = process.env.PORT || 8080;

// Create SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create 'urls' table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, is_deleted INTEGER DEFAULT 0)', function (err) {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table "urls" created successfully.');
            }
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/index.html'))
})

app.get('/api/screenshot/:url', async (req, res) => {
    // Retrieve URL from request parameters
    const url = decodeURIComponent(req.params.url);
    await takeScreenshot(url);
    console.log("Finished!")
    res.status(200).sendFile(path.join(__dirname, './screenshots', 'screenshot.png'));
})

app.post('/api/monitor/:url', (req, res) => {
    // Retrieve URL from request parameters
    const url = decodeURIComponent(req.params.url);
    let task_id

    // Insert URL into the SQLite database
    db.run('INSERT INTO urls (url) VALUES (?)', [url], function (err) {
        if (err) {
            return console.error('Error inserting URL into database:', err.message);
        }
        task_id = this.lastID
        console.log(`URL inserted with row id ${task_id}`);
        res.status(200).json({ id: task_id });
    });

    // res.status(500).json({ message: 'Internal Server Error' });

});

app.get('/api/monitor/:id', (req, res) => {
    const task_id = req.params.id;

    // Retrieve URL from the database based on the provided ID
    db.get('SELECT url FROM urls WHERE id = ? AND is_deleted = 0', [task_id], (err, row) => {
        if (err) {
            console.error('Error retrieving URL from database:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (row) {
                const url = row.url;
                console.log('Retrieved URL:', url);
                res.status(200).json({ message: 'Retrieved URL: ' + url });
            } else {
                console.log('URL not found')
                res.status(404).json({ message: 'URL not found' });
            }
        }
    });
});

app.delete('/api/monitor/:id', (req, res) => {
    const task_id = req.params.id;

    // Delete URL from the database based on the provided ID
    db.run('UPDATE urls SET is_deleted = 1 WHERE id = ?', [task_id], function (err) {
        if (err) {
            console.error('Error deleting URL from database:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (this.changes > 0) {
                console.log('URL deleted successfully');
                res.status(200).json({ message: 'URL deleted successfully' });
            } else {
                console.log('URL with provided ID not found');
                res.status(404).json({ message: 'URL with provided ID not found' });
            }
        }
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


///
///   Puppeteer Screenshot Logic
///

// Monitor web page on POST request
async function takeScreenshot(url) {
    console.log("Taking screenshot of " + url);

    // Launch the browser and open a new blank page
    let browser
    try {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome-stable', // Path to installed Chrome executable
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
    } catch (err) {
        console.log("Developing outside container, using puppeteer chrome...")
        browser = await puppeteer.launch();
    }

    // Navigate to provided URL
    try {
        const page = await browser.newPage();

        await page.goto(url);

        const path = "./screenshots/screenshot.png";

        const { pages, extraHeight, viewport } = await page.evaluate(() => {
            window.scrollTo(0, 0);
            const pageHeight = document.documentElement.scrollHeight;
            return {
                pages: Math.ceil(pageHeight / window.innerHeight),
                extraHeight:
                    (pageHeight % window.innerHeight) * window.devicePixelRatio,
                viewport: {
                    height: window.innerHeight * window.devicePixelRatio,
                    width: window.innerWidth * window.devicePixelRatio,
                },
            };
        });

        const sectionScreenshots = [];
        for (let index = 0; index < pages; index += 1) {
            // wait until animations are played
            await wait(400);

            const screenshot = await page.screenshot({
                type: "png",
                captureBeyondViewport: false,
            });
            sectionScreenshots.push(screenshot);

            await scrollDown(page);
        }

        if (pages === 1) {
            const screenshot = await Jimp.read(sectionScreenshots[0]);
            screenshot.write(path);

            return screenshot;
        }

        if (extraHeight > 0) {
            const cropped = await Jimp.read(sectionScreenshots.pop())
                .then((image) =>
                    image.crop(
                        0,
                        viewport.height - extraHeight,
                        viewport.width,
                        extraHeight
                    )
                )
                .then((image) => image.getBufferAsync(Jimp.AUTO));

            sectionScreenshots.push(cropped);
        }
        const result = await merge(sectionScreenshots, { direction: true });

        await new Promise((resolve) => {
            result.write(path, () => {
                resolve();
            });
        });
    } catch (e) {
        console.log(e);
    } finally {
        await browser.close();
    }
}

async function scrollDown(page) {
    return await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);

        return (
            window.scrollY >=
            document.documentElement.scrollHeight - window.innerHeight
        );
    });
}

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}