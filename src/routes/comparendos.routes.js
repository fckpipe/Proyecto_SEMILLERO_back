const express = require('express');
const router = express.Router();
const comparendosController = require('../controllers/comparendos.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/cedula/:cedula', verificarToken, comparendosController.getByCedula);
router.get('/:id', verificarToken, comparendosController.getById);

module.exports = router;
