const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');
const { verificarToken, verificarAdmin, filtrarPorSede } = require('../middleware/auth.middleware');

// Rutas administrativas (con filtrado por sede si aplica)
router.get('/', verificarAdmin, filtrarPorSede, citasController.getAll);
router.patch('/:id/estado', verificarAdmin, citasController.updateEstado);

// Rutas de ciudadano
router.get('/mis-citas', verificarToken, citasController.getMyCitas);
router.get('/:id', verificarToken, citasController.getById);
router.post('/', verificarToken, citasController.create);

module.exports = router;
