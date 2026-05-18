const express = require('express');
const router  = express.Router();
const { downloadExcel, downloadPDF } = require('../controllers/exportController');
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('superadmin', 'admin'));

router.get('/excel/:eventId', downloadExcel);
router.get('/pdf/:eventId',   downloadPDF);

module.exports = router;