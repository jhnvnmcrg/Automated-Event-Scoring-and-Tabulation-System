const RankBadge = ({ rank }) => {
  const styles = {
    1: 'bg-yellow-400 text-yellow-900',
    2: 'bg-gray-300 text-gray-800',
    3: 'bg-amber-600 text-white',
  };

  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
        ${styles[rank] || 'bg-gray-100 text-gray-500'}`}
    >
      {medals[rank] || `#${rank}`}
    </div>
  );
};

export default RankBadge;