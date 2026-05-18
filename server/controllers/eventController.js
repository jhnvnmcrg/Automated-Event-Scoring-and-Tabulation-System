const Event = require('../models/Event');

// @desc    Create event
// @route   POST /api/events
// @access  superadmin, admin
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  All authenticated
const getEvents = async (req, res) => {
  try {
    let query = {};

    // Judges only see their assigned events
    if (req.user.role === 'judge') {
      query = { assignedJudges: req.user._id };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedJudges', 'name email')
      .sort({ date: -1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  All authenticated
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedJudges', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  superadmin, admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  superadmin only
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign judges to event
// @route   PATCH /api/events/:id/judges
// @access  superadmin, admin
const assignJudges = async (req, res) => {
  try {
    const { judgeIds } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { assignedJudges: judgeIds },
      { new: true }
    ).populate('assignedJudges', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event status
// @route   PATCH /api/events/:id/status
// @access  superadmin, admin
const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  assignJudges,
  updateEventStatus,
};