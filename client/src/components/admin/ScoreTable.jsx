const ScoreTable = ({ scores }) => {
  // Group scores by participant
  const grouped = scores.reduce((acc, score) => {
    const pid = score.participant?._id;
    if (!acc[pid]) {
      acc[pid] = {
        participant: score.participant,
        judges: {},
      };
    }
    const jid = score.judge?._id;
    if (!acc[pid].judges[jid]) {
      acc[pid].judges[jid] = {
        judge:    score.judge,
        scores:   [],
      };
    }
    acc[pid].judges[jid].scores.push(score);
    return acc;
  }, {});

  const participants = Object.values(grouped);

  // Get unique judges across all scores
  const judgeMap = {};
  scores.forEach(s => {
    if (s.judge?._id) judgeMap[s.judge._id] = s.judge;
  });
  const judges = Object.values(judgeMap);

  // Get unique criteria
  const criteriaMap = {};
  scores.forEach(s => {
    if (s.criterion?._id) criteriaMap[s.criterion._id] = s.criterion;
  });
  const criteria = Object.values(criteriaMap);

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
      {participants.map(({ participant, judges: judgeData }) => (
        <div key={participant?._id} className="border border-gray-100 rounded-xl overflow-hidden">

          {/* Participant header */}
          <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between">
            <p className="font-semibold text-gray-800 text-sm">{participant?.name}</p>
            {participant?.identifier && (
              <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border">
                {participant.identifier}
              </span>
            )}
          </div>

          {/* Per-judge scores */}
          <div className="divide-y divide-gray-50">
            {Object.values(judgeData).map(({ judge, scores: jScores }) => (
              <div key={judge?._id} className="px-4 py-3">

                {/* Judge name */}
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  ⚖️ {judge?.name}
                </p>

                {/* Criteria scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jScores.map((score) => {
                    const pct = Math.round((score.value / score.criterion?.maxScore) * 100);
                    const color =
                      pct >= 80 ? 'text-green-600' :
                      pct >= 50 ? 'text-yellow-500' :
                      'text-red-500';

                    return (
                      <div
                        key={score._id}
                        className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {score.criterion?.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Weight: {score.criterion?.weight}%
                          </p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <span className={`text-sm font-bold ${color}`}>
                            {score.value}
                          </span>
                          <span className="text-xs text-gray-400">
                            /{score.criterion?.maxScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Judge subtotal */}
                <div className="mt-2 text-right">
                  <span className="text-xs text-gray-400">Raw total: </span>
                  <span className="text-xs font-bold text-gray-600">
                    {jScores.reduce((sum, s) => sum + s.value, 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Average row */}
          <div className="bg-blue-50 px-4 py-2.5 flex flex-wrap gap-3">
            <span className="text-xs font-semibold text-blue-700">Averages per criterion:</span>
            {criteria.map(criterion => {
              const relevantScores = scores.filter(
                s =>
                  s.participant?._id === participant?._id &&
                  s.criterion?._id === criterion._id
              );
              if (!relevantScores.length) return null;
              const avg = relevantScores.reduce((sum, s) => sum + s.value, 0) / relevantScores.length;
              return (
                <span key={criterion._id} className="text-xs text-blue-600">
                  {criterion.name}:{' '}
                  <span className="font-bold">{avg.toFixed(1)}</span>
                  <span className="text-blue-400">/{criterion.maxScore}</span>
                </span>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-400 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> ≥ 80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 50–79%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt; 50%
        </span>
      </div>
    </div>
  );
};

export default ScoreTable;