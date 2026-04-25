const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const adminController = require('../controllers/admin.controller');
const { verificarAdmin, verificarSuperAdmin, filtrarPorSede } = require('../middleware/auth.middleware');

// Dashboard - Accesible para Admin Sede y Super Admin ( Filtrado por sede automático )
router.get('/dashboard', verificarAdmin, filtrarPorSede, dashboardController.getMetrics);

// Gestión de Usuarios Admin - Solo para Super Admin
router.get('/usuarios', verificarSuperAdmin, adminController.getAllAdmins);
router.post('/usuarios', verificarSuperAdmin, adminController.createAdmin);
router.put('/usuarios/:id', verificarSuperAdmin, adminController.updateAdmin);
router.patch('/usuarios/:id/status', verificarSuperAdmin, adminController.toggleStatus);

module.exports = router;
