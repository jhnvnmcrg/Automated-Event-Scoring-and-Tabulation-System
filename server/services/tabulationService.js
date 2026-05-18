const Score       = require('../models/Score');
const Criterion   = require('../models/Criterion');
const Participant = require('../models/Participant');
const Result      = require('../models/Result');

/**
 * Recalculate results for all participants in a category.
 * Called every time a score is submitted or updated.
 */
const tabulateCategory = async (categoryId, eventId) => {
  // 1. Load all criteria for the category
  const criteria = await Criterion.find({ category: categoryId });
  if (!criteria.length) return [];

  // 2. Load all participants in the category
  const participants = await Participant.find({ category: categoryId });
  if (!participants.length) return [];

  // 3. Load all scores for this category
  const scores = await Score.find({ category: categoryId });

  // 4. Get unique judge count
  const uniqueJudges = [...new Set(scores.map(s => s.judge.toString()))];
  const judgeCount   = uniqueJudges.length;

  const results = [];

  for (const participant of participants) {
    const breakdown = [];
    let totalScore  = 0;

    for (const criterion of criteria) {
      // All scores for this participant + criterion
      const criterionScores = scores.filter(
        s =>
          s.participant.toString() === participant._id.toString() &&
          s.criterion.toString()   === criterion._id.toString()
      );

      const averageScore =
        criterionScores.length > 0
          ? criterionScores.reduce((sum, s) => sum + s.value, 0) /
            criterionScores.length
          : 0;

      // Weighted contribution: (average / maxScore) * weight
      const weightedScore = (averageScore / criterion.maxScore) * criterion.weight;
      totalScore += weightedScore;

      breakdown.push({
        criterion:     criterion._id,
        criterionName: criterion.name,
        averageScore:  Math.round(averageScore * 100) / 100,
        weightedScore: Math.round(weightedScore * 100) / 100,
        weight:        criterion.weight,
        maxScore:      criterion.maxScore,
      });
    }

    // Upsert result
    const result = await Result.findOneAndUpdate(
      { participant: participant._id, category: categoryId },
      {
        participant: participant._id,
        category:    categoryId,
        event:       eventId,
        totalScore:  Math.round(totalScore * 100) / 100,
        breakdown,
        judgeCount,
      },
      { upsert: true, new: true }
    );

    results.push(result);
  }

  // 5. Rank participants by totalScore descending
  results.sort((a, b) => b.totalScore - a.totalScore);
  for (let i = 0; i < results.length; i++) {
    // Handle ties — same score = same rank
    if (i > 0 && results[i].totalScore === results[i - 1].totalScore) {
      results[i].rank = results[i - 1].rank;
    } else {
      results[i].rank = i + 1;
    }
    await Result.findByIdAndUpdate(results[i]._id, { rank: results[i].rank });
  }

  return results;
};

module.exports = { tabulateCategory };