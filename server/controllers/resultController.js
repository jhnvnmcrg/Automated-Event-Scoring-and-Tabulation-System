const Result    = require('../models/Result');
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

// @desc    Get results for a full event (all categories)
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

module.exports = { getResultsByCategory, getResultsByEvent, recalculate };