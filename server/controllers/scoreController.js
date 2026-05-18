const Score                 = require('../models/Score');
const Criterion             = require('../models/Criterion');
const Participant           = require('../models/Participant');
const { tabulateCategory }  = require('../services/tabulationService');

// @desc    Submit or update a batch of scores for one participant
// @route   POST /api/scores
// @access  judge, admin, superadmin
const submitScores = async (req, res) => {
  try {
    const { participantId, categoryId, eventId, scores } = req.body;
    // scores = [{ criterionId, value }, ...]

    if (!participantId || !categoryId || !eventId || !scores?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate participant belongs to category
    const participant = await Participant.findById(participantId);
    if (!participant || participant.category.toString() !== categoryId) {
      return res.status(400).json({ message: 'Invalid participant or category' });
    }

    const saved = [];

    for (const { criterionId, value } of scores) {
      // Validate criterion & max score
      const criterion = await Criterion.findById(criterionId);
      if (!criterion) continue;

      if (value < 0 || value > criterion.maxScore) {
        return res.status(400).json({
          message: `Score for "${criterion.name}" must be between 0 and ${criterion.maxScore}`,
        });
      }

      // Upsert — one score per judge per participant per criterion
      const score = await Score.findOneAndUpdate(
        {
          judge:       req.user._id,
          participant: participantId,
          criterion:   criterionId,
        },
        {
          judge:       req.user._id,
          participant: participantId,
          criterion:   criterionId,
          category:    categoryId,
          event:       eventId,
          value,
        },
        { upsert: true, new: true }
      );

      saved.push(score);
    }

    // Re-tabulate after saving
    const results = await tabulateCategory(categoryId, eventId);

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('scores_updated', {
        categoryId,
        results,
      });
    }

    res.status(200).json({ success: true, scores: saved, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scores submitted by the current judge for a participant
// @route   GET /api/scores/my/:participantId
// @access  judge, admin, superadmin
const getMyScoresForParticipant = async (req, res) => {
  try {
    const scores = await Score.find({
      judge:       req.user._id,
      participant: req.params.participantId,
    }).populate('criterion', 'name maxScore weight');

    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all scores for a category (admin view)
// @route   GET /api/scores/category/:categoryId
// @access  admin, superadmin
const getScoresByCategory = async (req, res) => {
  try {
    const scores = await Score.find({ category: req.params.categoryId })
      .populate('judge',       'name email')
      .populate('participant', 'name identifier')
      .populate('criterion',   'name maxScore weight');

    res.status(200).json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check scoring progress for a category
// @route   GET /api/scores/progress/:categoryId
// @access  admin, superadmin
const getScoringProgress = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [participants, criteria, scores] = await Promise.all([
      Participant.find({ category: categoryId }),
      Criterion.find({ category: categoryId }),
      Score.find({ category: categoryId }).populate('judge', 'name'),
    ]);

    const judges = [...new Map(
      scores.map(s => [s.judge._id.toString(), s.judge])
    ).values()];

    const progress = participants.map(p => {
      const judgeProgress = judges.map(judge => {
        const judgeScores = scores.filter(
          s =>
            s.participant.toString() === p._id.toString() &&
            s.judge._id.toString()   === judge._id.toString()
        );
        return {
          judge:       judge,
          scored:      judgeScores.length,
          total:       criteria.length,
          isComplete:  judgeScores.length === criteria.length,
        };
      });

      return {
        participant:   p,
        judgeProgress,
        totalScored:   judgeProgress.filter(j => j.isComplete).length,
        totalJudges:   judges.length,
      };
    });

    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a score (admin only)
// @route   DELETE /api/scores/:id
// @access  superadmin, admin
const deleteScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) return res.status(404).json({ message: 'Score not found' });

    await tabulateCategory(score.category, score.event);

    res.status(200).json({ success: true, message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitScores,
  getMyScoresForParticipant,
  getScoresByCategory,
  getScoringProgress,
  deleteScore,
};