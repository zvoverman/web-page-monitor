const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;
const monitorRoutes = require('./routes/monitorRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount monitor routes
app.use('/api', monitorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
