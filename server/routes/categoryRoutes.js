const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategoriesByEvent,
  updateCategory,
  deleteCategory,
  createCriterion,
  getCriteriaByCategory,
  updateCriterion,
  deleteCriterion,
  addParticipant,
  getParticipantsByCategory,
  updateParticipant,
  deleteParticipant,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Categories
router.post('/', authorize('superadmin', 'admin'), createCategory);
router.get('/event/:eventId', getCategoriesByEvent);
router.put('/:id', authorize('superadmin', 'admin'), updateCategory);
router.delete('/:id', authorize('superadmin', 'admin'), deleteCategory);

// Criteria
router.post('/criteria', authorize('superadmin', 'admin'), createCriterion);
router.get('/:categoryId/criteria', getCriteriaByCategory);
router.put('/criteria/:id', authorize('superadmin', 'admin'), updateCriterion);
router.delete('/criteria/:id', authorize('superadmin', 'admin'), deleteCriterion);

// Participants
router.post('/participants', authorize('superadmin', 'admin'), addParticipant);
router.get('/:categoryId/participants', getParticipantsByCategory);
router.put('/participants/:id', authorize('superadmin', 'admin'), updateParticipant);
router.delete('/participants/:id', authorize('superadmin', 'admin'), deleteParticipant);

module.exports = router;