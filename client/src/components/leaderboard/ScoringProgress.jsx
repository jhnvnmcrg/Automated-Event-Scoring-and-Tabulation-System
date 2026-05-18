import API from '../../api/axios';
import { useEffect, useState } from 'react';

const ScoringProgress = ({ categoryId }) => {
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    const load = async () => {
      try {
        const { data } = await API.get(`/scores/progress/${categoryId}`);
        setProgress(data.progress);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [categoryId]);

  if (loading) return null;
  if (!progress.length) return (
    <p className="text-sm text-gray-400 text-center py-4">No scoring data yet</p>
  );

  return (
    <div className="space-y-3">
      {progress.map(({ participant, totalScored, totalJudges, judgeProgress }) => {
        const pct = totalJudges > 0 ? Math.round((totalScored / totalJudges) * 100) : 0;
        return (
          <div key={participant._id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">{participant.name}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                pct === 100
                  ? 'bg-green-100 text-green-700'
                  : pct > 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {totalScored}/{totalJudges} judges
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Per-judge status */}
            {judgeProgress.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {judgeProgress.map(({ judge, isComplete }) => (
                  <span
                    key={judge._id}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isComplete
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? '✓' : '○'} {judge.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ScoringProgress;