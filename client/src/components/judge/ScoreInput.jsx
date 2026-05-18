const ScoreInput = ({ criterion, value, onChange, disabled }) => {
  const percentage = Math.round((value / criterion.maxScore) * 100);

  const getColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{criterion.name}</p>
          {criterion.description && (
            <p className="text-xs text-gray-400 mt-0.5">{criterion.description}</p>
          )}
          <p className="text-xs text-blue-500 mt-0.5">Weight: {criterion.weight}%</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${getColor()}`}>{value}</span>
          <span className="text-gray-400 text-sm">/{criterion.maxScore}</span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={criterion.maxScore}
        step={1}
        value={value}
        onChange={(e) => onChange(criterion._id, Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
      />

      {/* Tick labels */}
      <div className="flex justify-between text-xs text-gray-300 mt-1">
        <span>0</span>
        <span>{Math.round(criterion.maxScore * 0.25)}</span>
        <span>{Math.round(criterion.maxScore * 0.5)}</span>
        <span>{Math.round(criterion.maxScore * 0.75)}</span>
        <span>{criterion.maxScore}</span>
      </div>

      {/* Number input override */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-400">Manual:</span>
        <input
          type="number"
          min={0}
          max={criterion.maxScore}
          value={value}
          onChange={(e) => {
            const v = Math.min(criterion.maxScore, Math.max(0, Number(e.target.value)));
            onChange(criterion._id, v);
          }}
          disabled={disabled}
          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default ScoreInput;