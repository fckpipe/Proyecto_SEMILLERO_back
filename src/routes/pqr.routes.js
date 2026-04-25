const express = require('express');
const router = express.Router();
const pqrController = require('../controllers/pqr.controller');

// Chat abierto al público, soporta Event Stream
router.post('/mensaje', pqrController.manejarMensajeStr);
router.post('/escalar', pqrController.escalarHumano);

module.exports = router;
