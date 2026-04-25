const express = require('express');
const router = express.Router();
const sedesController = require('../controllers/sedes.controller');
const verifyAdmin = require('../middleware/adminAuth.middleware');

router.get('/', sedesController.getAll); // Público
router.post('/', verifyAdmin, sedesController.create);
router.put('/:id', verifyAdmin, sedesController.update);

module.exports = router;
