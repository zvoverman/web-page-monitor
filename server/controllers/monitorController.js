const puppeteer = require("puppeteer")
const { validationResult } = require('express-validator');

async function submitMonitoringTask(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        let url = decodeURIComponent(req.query.url)
        return res.send(url);
    }
}

function getMonitoringStatus(req, res) {
    const taskId = req.params.id;
    res.status(200).json({ status: 'Monitoring task status', taskId }); // 200 OK
}

function cancelMonitoringTask(req, res) {
    const taskId = req.params.id;
    res.status(200).json({ message: 'Monitoring task canceled', taskId }); // 200 OK
}

module.exports = {
    submitMonitoringTask,
    getMonitoringStatus,
    cancelMonitoringTask
};
