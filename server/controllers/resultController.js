const Result      = require('../models/Result');
const Score       = require('../models/Score');
const Participant = require('../models/Participant');
const Category    = require('../models/Category');
const { tabulateCategory } = require('../services/tabulationService');

// @desc    Get results/leaderboard for a category
// @route   GET /api/results/category/:categoryId
// @access  All authenticated
const getResultsByCategory = async (req, res) => {
  try {
    const results = await Result.find({ category: req.params.categoryId })
      .populate('participant', 'name identifier order')
      .sort({ rank: 1 });

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full results for an event (all categories)
// @route   GET /api/results/event/:eventId
// @access  All authenticated
const getResultsByEvent = async (req, res) => {
  try {
    const results = await Result.find({ event: req.params.eventId })
      .populate('participant', 'name identifier')
      .populate('category',    'name')
      .sort({ category: 1, rank: 1 });

    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed breakdown for a single participant
// @route   GET /api/results/participant/:participantId/category/:categoryId
// @access  All authenticated
const getParticipantResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      participant: req.params.participantId,
      category:    req.params.categoryId,
    }).populate('participant', 'name identifier');

    if (!result) {
      return res.status(404).json({ message: 'No result found yet' });
    }

    // Also get per-judge scores for transparency
    const judgeScores = await Score.find({
      participant: req.params.participantId,
      category:    req.params.categoryId,
    })
      .populate('judge',     'name')
      .populate('criterion', 'name maxScore weight');

    res.status(200).json({ success: true, result, judgeScores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event summary stats
// @route   GET /api/results/event/:eventId/summary
// @access  admin, superadmin
const getEventSummary = async (req, res) => {
  try {
    const { eventId } = req.params;

    const categories = await Category.find({ event: eventId });

    const summary = await Promise.all(
      categories.map(async (cat) => {
        const results     = await Result.find({ category: cat._id })
          .populate('participant', 'name identifier')
          .sort({ rank: 1 });

        const scores      = await Score.find({ category: cat._id });
        const judgeCount  = [...new Set(scores.map(s => s.judge.toString()))].length;
        const topScorer   = results[0] || null;

        return {
          category:     cat,
          totalResults: results.length,
          judgeCount,
          topScorer,
          results:      results.slice(0, 3), // top 3
        };
      })
    );

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually trigger recalculation
// @route   POST /api/results/recalculate/:categoryId
// @access  superadmin, admin
const recalculate = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { eventId }    = req.body;
    const results = await tabulateCategory(categoryId, eventId);
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResultsByCategory,
  getResultsByEvent,
  getParticipantResult,
  getEventSummary,
  recalculate,
};