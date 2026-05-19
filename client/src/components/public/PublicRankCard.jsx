import { useState } from 'react';

const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

const BAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

const PublicRankCard = ({ result, animate }) => {
  const [expanded, setExpanded] = useState(false);

  const isTop3   = result.rank <= 3;
  const cardBase = `rounded-2xl border transition-all duration-500 cursor-pointer select-none ${
    animate ? 'animate-pulse-once' : ''
  }`;

  const cardStyle =
    result.rank === 1 ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md' :
    result.rank === 2 ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 shadow-sm' :
    result.rank === 3 ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm' :
    'border-gray-100 bg-white hover:shadow-sm';

  return (
    <div
      className={`${cardBase} ${cardStyle}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Rank */}
        <div className="flex-shrink-0 w-12 text-center">
          {isTop3 ? (
            <span className="text-3xl">{medals[result.rank]}</span>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <span className="text-sm font-bold text-gray-500">#{result.rank}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold truncate ${isTop3 ? 'text-lg text-gray-900' : 'text-base text-gray-800'}`}>
            {result.participant?.name}
          </p>
          {result.participant?.identifier && (
            <p className="text-xs text-gray-400 mt-0.5">
              {result.participant.identifier}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            Scored by {result.judgeCount} judge{result.judgeCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <p className={`font-black ${
            result.rank === 1 ? 'text-3xl text-yellow-500' :
            result.rank === 2 ? 'text-2xl text-gray-500' :
            result.rank === 3 ? 'text-2xl text-amber-600' :
            'text-xl text-blue-600'
          }`}>
            {result.totalScore?.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">/ 100 pts</p>
        </div>

        <span className="text-gray-300 text-sm ml-1">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Score Breakdown */}
      {expanded && result.breakdown?.length > 0 && (
        <div className="px-5 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Score Breakdown
          </p>
          {result.breakdown.map((b, i) => {
            const pct = Math.min(100, (b.averageScore / b.maxScore) * 100);
            return (
              <div key={b.criterion}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600 font-medium">{b.criterionName}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-700">
                      {b.averageScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">/{b.maxScore}</span>
                    <span className="text-xs text-blue-400 ml-1">({b.weight}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-gray-100 flex justify-between">
            <span className="text-xs text-gray-400">Weighted Total</span>
            <span className="text-sm font-bold text-blue-600">
              {result.totalScore?.toFixed(2)} / 100
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRankCard;