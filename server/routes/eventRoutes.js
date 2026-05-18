const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  assignJudges,
  updateEventStatus,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // all routes require auth

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', authorize('superadmin', 'admin'), createEvent);
router.put('/:id', authorize('superadmin', 'admin'), updateEvent);
router.delete('/:id', authorize('superadmin'), deleteEvent);
router.patch('/:id/judges', authorize('superadmin', 'admin'), assignJudges);
router.patch('/:id/status', authorize('superadmin', 'admin'), updateEventStatus);

module.exports = router;