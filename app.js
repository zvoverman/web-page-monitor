const express = require('express');
const cors = require('cors');
const path = require('path')
const puppeteer = require('puppeteer')
const axios = require('axios')
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());

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

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the '/client/screenshots' directory
app.use(express.static(path.join(__dirname, '/dist')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/dist/index.html'))
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
                res.status(200).json({ message: 'Retrieved URL: ' + url});
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


// Monitor web page on POST request
async function monitor(id) {
	let url = map[id]

	console.log(url)

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
		await page.screenshot({ path: path.join(__dirname, '/public/screenshots/screenshot_' + id + '.jpg') });

	} catch (err) {
		console.log(`Error: ${err.message}`);
	} finally {
		await browser.close();
		console.log(`Screenshot has been captured successfully`);
	}

	await browser.close()
}
