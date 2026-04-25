const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { verificarAdmin } = require('../middleware/auth.middleware');

router.get('/', verificarAdmin, logsController.getActivityLogs);
router.get('/email', verificarAdmin, logsController.getEmailLogs);

module.exports = router;
