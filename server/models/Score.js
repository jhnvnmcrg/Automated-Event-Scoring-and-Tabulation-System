const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    criterion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Criterion',
      required: true,
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
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// One score per judge per participant per criterion
scoreSchema.index(
  { judge: 1, participant: 1, criterion: 1 },
  { unique: true }
);

module.exports = mongoose.model('Score', scoreSchema);