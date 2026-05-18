const express = require('express');
const router  = express.Router();
const {
  submitScores,
  getMyScoresForParticipant,
  getScoresByCategory,
  getScoringProgress,
  deleteScore,
} = require('../controllers/scoreController');
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/',                    authorize('superadmin', 'admin', 'judge'), submitScores);
router.get('/my/:participantId',    authorize('superadmin', 'admin', 'judge'), getMyScoresForParticipant);
router.get('/category/:categoryId', authorize('superadmin', 'admin'),          getScoresByCategory);
router.get('/progress/:categoryId', authorize('superadmin', 'admin'),          getScoringProgress);
router.delete('/:id',               authorize('superadmin', 'admin'),          deleteScore);

module.exports = router;