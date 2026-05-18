const ScoreBar = ({ label, value, max = 100, weight, color = 'bg-blue-500' }) => {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-700">{value.toFixed(1)}</span>
          <span className="text-xs text-gray-400">/{max}</span>
          {weight && (
            <span className="ml-1 text-xs text-blue-400">({weight}%)</span>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;