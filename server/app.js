// server/app.js
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve your Vue app's static files
app.use('/client', express.static(path.join(__dirname, '../client/dist')));

// Define a catch-all route to serve your Vue app's entry point
app.get('/client/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Add a separate catch-all route to handle the root path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
