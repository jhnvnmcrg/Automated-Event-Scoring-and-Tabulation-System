const express = require('express');
const router  = express.Router();
const {
  getResultsByCategory,
  getResultsByEvent,
  recalculate,
} = require('../controllers/resultController');
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/category/:categoryId', getResultsByCategory);
router.get('/event/:eventId',       getResultsByEvent);
router.post('/recalculate/:categoryId', authorize('superadmin', 'admin'), recalculate);

module.exports = router;