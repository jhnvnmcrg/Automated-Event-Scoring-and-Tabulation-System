const express     = require('express');
const router      = express.Router();
const Event       = require('../models/Event');
const Category    = require('../models/Category');
const Result      = require('../models/Result');
const Score       = require('../models/Score');

// @desc    Get public event info
// @route   GET /api/public/events/:eventId
router.get('/events/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .select('name description date venue status');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get public categories for an event
// @route   GET /api/public/events/:eventId/categories
router.get('/events/:eventId/categories', async (req, res) => {
  try {
    const categories = await Category.find({ event: req.params.eventId })
      .select('name description order')
      .sort({ order: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get public leaderboard for a category
// @route   GET /api/public/results/:categoryId
router.get('/results/:categoryId', async (req, res) => {
  try {
    const results = await Result.find({ category: req.params.categoryId })
      .populate('participant', 'name identifier order')
      .sort({ rank: 1 });
    res.status(200).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get public scoring progress (no judge names exposed)
// @route   GET /api/public/progress/:categoryId
router.get('/progress/:categoryId', async (req, res) => {
  try {
    const scores     = await Score.find({ category: req.params.categoryId });
    const judgeCount = [...new Set(scores.map(s => s.judge.toString()))].length;
    const scoreCount = scores.length;
    res.status(200).json({ success: true, judgeCount, scoreCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;