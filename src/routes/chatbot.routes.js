const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// Chat abierto al público, no usa auth middleware
router.post('/mensaje', chatbotController.manejarMensaje);

module.exports = router;
