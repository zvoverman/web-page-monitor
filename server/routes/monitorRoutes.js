const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const { submitMonitoringTask, getMonitoringStatus, cancelMonitoringTask } = require('../controllers/monitorController');

// Routes
router.post('/monitor', query('url').notEmpty(), submitMonitoringTask);
router.get('/monitor/:id', getMonitoringStatus);
router.delete('/monitor/:id', cancelMonitoringTask);

module.exports = router;
