const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
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
    totalScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    breakdown: [
      {
        criterion:   { type: mongoose.Schema.Types.ObjectId, ref: 'Criterion' },
        criterionName: String,
        averageScore: Number,
        weightedScore: Number,
        weight:       Number,
        maxScore:     Number,
      },
    ],
    judgeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

resultSchema.index({ participant: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);