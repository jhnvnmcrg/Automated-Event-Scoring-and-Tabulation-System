const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
    },
    identifier: {
      type: String,       // e.g. student ID, team code
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    order: {
      type: Number,
      default: 0,         // presentation order
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', participantSchema);