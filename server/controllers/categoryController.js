const Category = require('../models/Category');
const Criterion = require('../models/Criterion');
const Participant = require('../models/Participant');

// ─── CATEGORIES ────────────────────────────────────────────

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoriesByEvent = async (req, res) => {
  try {
    const categories = await Category.find({ event: req.params.eventId })
      .sort({ order: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    // Cascade delete criteria and participants
    await Criterion.deleteMany({ category: req.params.id });
    await Participant.deleteMany({ category: req.params.id });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CRITERIA ──────────────────────────────────────────────

const createCriterion = async (req, res) => {
  try {
    const criterion = await Criterion.create(req.body);
    res.status(201).json({ success: true, criterion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCriteriaByCategory = async (req, res) => {
  try {
    const criteria = await Criterion.find({ category: req.params.categoryId });
    res.status(200).json({ success: true, criteria });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCriterion = async (req, res) => {
  try {
    const criterion = await Criterion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!criterion) return res.status(404).json({ message: 'Criterion not found' });
    res.status(200).json({ success: true, criterion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCriterion = async (req, res) => {
  try {
    await Criterion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Criterion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PARTICIPANTS ───────────────────────────────────────────

const addParticipant = async (req, res) => {
  try {
    const participant = await Participant.create(req.body);
    res.status(201).json({ success: true, participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getParticipantsByCategory = async (req, res) => {
  try {
    const participants = await Participant.find({
      category: req.params.categoryId,
    }).sort({ order: 1 });
    res.status(200).json({ success: true, participants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!participant)
      return res.status(404).json({ message: 'Participant not found' });
    res.status(200).json({ success: true, participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteParticipant = async (req, res) => {
  try {
    await Participant.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Participant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};