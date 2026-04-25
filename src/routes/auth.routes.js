const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Registro de Ciudadanos
router.post('/register', authController.registerCiudadano);

// Login Unificado (Busca Ciudadano o Admin)
router.post('/login', authController.loginUnificado);

// Endpoints Legacy (Redirigen internamente a Login Unificado)
router.post('/admin/login', authController.loginAdmin);

// ── Perfil del Ciudadano ──────────────────────────────────────────
router.get('/perfil',  verificarToken, authController.getPerfil);
router.put('/perfil',  verificarToken, authController.updatePerfil);

// Endpoint de diagnóstico temporal
router.get('/debug', authController.debugDatabase);

module.exports = router;
