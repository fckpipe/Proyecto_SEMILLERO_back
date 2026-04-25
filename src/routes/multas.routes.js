const express = require('express');
const router = express.Router();
const controller = require('../controllers/multas.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// ── Públicas (Consulta abierta) ──────────────────────────────────────────────
router.get('/cedula/:cedula', controller.consultarPorCedula);
router.get('/placa/:placa',  controller.consultarPorPlaca);

// ── Protegidas — Ciudadano ────────────────────────────────────────────────────
router.post('/aplicar-descuento', verificarToken, controller.aplicarDescuento);

// ── Admin: Limpiar cache específico ──────────────────────────────────────────
router.delete('/cache/:tipo/:valor', verificarToken, controller.limpiarCache);

module.exports = router;
