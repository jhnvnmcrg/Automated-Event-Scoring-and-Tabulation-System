const mongoose = require('mongoose');

const criterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Criterion name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: 1,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: 0,
      max: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Criterion', criterionSchema);