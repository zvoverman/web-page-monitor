const express = require('express');
const cors = require('cors');
const path = require('path')
const sqlite3 = require('sqlite3').verbose();

// Screenshot
const puppeteer = require('puppeteer')
const merge = require("merge-img");
const Jimp = require("jimp");
const { imgDiff } = require("img-diff-js");

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
app.use(express.json());
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

const port = process.env.PORT || 8080;

// Create SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create urls table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, crop_blob BLOB NOT NULL, data TEXT NOT NULL, is_deleted INTEGER DEFAULT 0)', function (err) {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table "urls" created successfully.');
            }
        });
    }
});

// Take a full-page screenshot of specified website
app.get('/api/screenshot/:url', async (req, res) => {
    const url = decodeURIComponent(req.params.url);
    await takeScreenshot(url, "./screenshots/temp_screenshot.png");
    console.log("Finished!")
    res.status(200).sendFile(path.join(__dirname, './screenshots', 'temp_screenshot.png'));
})

// Get all tasks from urls
app.get('/api/urls', (req, res) => {
    // Do not send deleted rows
    const query = 'SELECT * FROM urls WHERE is_deleted = 0';
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(rows);
        }
    });
});

// Enter monitoring request into database
app.post('/api/monitor', async (req, res) => {
    const url = req.body.url;
    const data = JSON.stringify(req.body.data);
    const crop_blob = req.body.crop_blob;
    let task_id = -1;

    console.log("crop_blob", crop_blob)

    db.run('INSERT INTO urls (url, crop_blob, data) VALUES (?, ?, ?)', [url, crop_blob, data], async function (err) {
        if (err) {
            return console.error('Error inserting URL into database:', err.message);
        }
        task_id = this.lastID;
        console.log(`URL inserted with row id ${task_id}`);
        const path = "./screenshots/" + task_id + "_screenshot.png";
        await takeScreenshot(url, path);
        res.status(200).json({ id: task_id });
    });
});

// Get current status of task
app.get('/api/monitor/:id', (req, res) => {
    const task_id = req.params.id;

    db.get('SELECT url, crop_blob, data FROM urls WHERE id = ? AND is_deleted = 0', [task_id], async (err, row) => {
        if (err) {
            console.error('Error retrieving data from database:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
        } else {
            if (row) {
                const url = row.url;
                const crop_blob = new Blob([JSON.stringify(row.crop_blob, null, 2)], {
                    type: "application/json",
                });
                const dataString = row.data;
                const dataObject = JSON.parse(dataString);

                console.log('Retrieved URL:', url);
                console.log('Retrieved Image Blob:', crop_blob);
                console.log('Retrieved Data:', dataObject);

                const new_path = "./screenshots/" + task_id + "_new_screenshot.png";
                const original_path = "./screenshots/" + task_id + "_screenshot.png";
                const diff_path = "./screenshots/" + task_id + "_diff.png";

                await takeScreenshot(url, new_path);

                await cropImage(new_path, dataObject.x, dataObject.y, dataObject.width, dataObject.height);
                await cropImage(original_path, dataObject.x, dataObject.y, dataObject.width, dataObject.height);

                imgDiff({
                    actualFilename: new_path,
                    expectedFilename: original_path,
                    diffFilename: diff_path,
                    options: {
                        threshold: 0.2,   // default 0.1
                        includeAA: true  // default false
                    }
                })
                    .then((result) => {
                        console.log(result);
                        res.status(200).json({ url, result });
                    });

            } else {
                console.log('Data not found');
                res.status(404).json({ message: 'Data not found' });
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
async function takeScreenshot(url, file_path) {
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

        const path = file_path;

        // Set the viewport size
        await page.setViewport({ width: 1920, height: 1080 });

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

async function cropImage(path, x, y, width, height) {
    try {
      // Load the image
      const image = await Jimp.read(path);
      
      // Crop the image
      const croppedImage = image.crop(x, y, width, height);
      
      // Save the cropped image
      await croppedImage.writeAsync(path);
      
      console.log('Image cropped and saved successfully.');
    } catch (error) {
      console.error('Error:', error);
    }
  }
