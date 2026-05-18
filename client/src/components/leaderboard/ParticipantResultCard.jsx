import { useState } from 'react';
import RankBadge    from './RankBadge';
import ScoreBar     from './ScoreBar';

const BAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

const ParticipantResultCard = ({ result, isHighlighted = false, onClick }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
    if (onClick) onClick(result);
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 cursor-pointer
        ${isHighlighted
          ? 'border-blue-400 bg-blue-50 shadow-md'
          : 'border-gray-100 bg-white hover:shadow-sm hover:border-gray-200'
        }`}
      onClick={handleToggle}
    >
      {/* Main Row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <RankBadge rank={result.rank} />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {result.participant?.name}
          </p>
          {result.participant?.identifier && (
            <p className="text-xs text-gray-400">{result.participant.identifier}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {result.totalScore?.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">/ 100 pts</p>
        </div>

        <span className="text-gray-300 text-lg">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Breakdown */}
      {expanded && result.breakdown?.length > 0 && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Score Breakdown
          </p>
          {result.breakdown.map((b, i) => (
            <ScoreBar
              key={b.criterion}
              label={b.criterionName}
              value={b.averageScore}
              max={b.maxScore}
              weight={b.weight}
              color={BAR_COLORS[i % BAR_COLORS.length]}
            />
          ))}
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Scored by {result.judgeCount} judge{result.judgeCount !== 1 ? 's' : ''}
            </span>
            <span className="text-sm font-bold text-blue-600">
              Total: {result.totalScore?.toFixed(2)} / 100
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantResultCard;