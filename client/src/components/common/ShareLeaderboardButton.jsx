import { useState } from 'react';

const ShareLeaderboardButton = ({ eventId, categoryId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/public/${eventId}${
      categoryId ? `?category=${categoryId}` : ''
    }`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
      }`}
    >
      {copied ? '✅ Copied!' : '🔗 Share Live Link'}
    </button>
  );
};

export default ShareLeaderboardButton;