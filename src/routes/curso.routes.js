const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/curso.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Endpoint de diagnóstico (Público temporalmente para debugear)
router.get('/debug-progreso', cursoController.debugProgreso);

// Endpoints ciudadanos autenticados vinculados a su usuario (verificarToken requerido)
router.use(verificarToken);

router.get('/modulos', cursoController.getModulos);
router.get('/progreso', cursoController.getProgreso);
router.post('/iniciar', cursoController.iniciarCurso);
router.post('/modulo/:id/completar', cursoController.completarModulo);
router.post('/examen/iniciar', cursoController.iniciarExamen);
router.post('/examen/entregar', cursoController.entregarExamen);
router.post('/trampa', cursoController.registrarTrampa);
router.get('/certificado', cursoController.getCertificado);

module.exports = router;
