const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horarios.controller');
const { verificarToken, verificarAdmin, filtrarPorSede } = require('../middleware/auth.middleware');

// Public/Ciudadano (Cita agendamiento)
router.get('/', verificarToken, horariosController.getAvailable);

// Admin (Gestión de horarios con filtrado por sede)
router.get('/admin', verificarAdmin, filtrarPorSede, horariosController.getAvailable);
router.post('/', verificarAdmin, horariosController.create);
router.put('/:id', verificarAdmin, horariosController.update);
router.delete('/:id', verificarAdmin, horariosController.deactivate);

module.exports = router;
