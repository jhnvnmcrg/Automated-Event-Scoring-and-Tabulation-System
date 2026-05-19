import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams }               from 'react-router-dom';
import PublicAPI                                     from '../api/publicApi';
import usePublicSocket                               from '../hooks/usePublicSocket';
import PublicRankCard                                from '../components/public/PublicRankCard';
import PublicLeaderboardChart                        from '../components/public/PublicLeaderboardChart';

const PublicLeaderboard = () => {
  const { eventId }                   = useParams();
  const [searchParams]                = useSearchParams();
  const defaultCategory               = searchParams.get('category');

  const [event,       setEvent]       = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [activeTab,   setActiveTab]   = useState(defaultCategory || null);
  const [results,     setResults]     = useState({});
  const [progress,    setProgress]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flashIds,    setFlashIds]    = useState([]);
  const [copied,      setCopied]      = useState(false);
  const [viewMode,    setViewMode]    = useState('list'); // 'list' | 'chart'

  const prevResultsRef = useRef({});

  const categoryResults = activeTab ? (results[activeTab] || []) : [];

  // ── Socket handler ────────────────────────────────────────
  const handleScoresUpdated = useCallback((categoryId, newResults) => {
    setResults(prev => {
      const prevList = prev[categoryId] || [];

      // Find which participants changed rank
      const changed = newResults.filter(nr => {
        const old = prevList.find(pr =>
          pr.participant?._id === nr.participant?._id ||
          pr.participant === nr.participant
        );
        return !old || old.rank !== nr.rank || old.totalScore !== nr.totalScore;
      });

      setFlashIds(changed.map(r => r.participant?._id || r.participant));
      setTimeout(() => setFlashIds([]), 1500);

      return { ...prev, [categoryId]: newResults };
    });

    setLastUpdated(new Date());
  }, []);

  // Connect public socket
  usePublicSocket(eventId, handleScoresUpdated);

  // ── Load event + categories ───────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, catRes] = await Promise.all([
          PublicAPI.get(`/public/events/${eventId}`),
          PublicAPI.get(`/public/events/${eventId}/categories`),
        ]);
        setEvent(evRes.data.event);
        setCategories(catRes.data.categories);

        const firstTab = defaultCategory || catRes.data.categories[0]?._id;
        if (firstTab) setActiveTab(firstTab);
      } catch {
        setEvent(null);
      }
      setLoading(false);
    };
    load();
  }, [eventId]);

  // ── Load results + progress on tab change ─────────────────
  useEffect(() => {
    if (!activeTab) return;
    const load = async () => {
      try {
        const [resRes, progRes] = await Promise.all([
          PublicAPI.get(`/public/results/${activeTab}`),
          PublicAPI.get(`/public/progress/${activeTab}`),
        ]);
        setResults(prev => ({ ...prev, [activeTab]: resRes.data.results }));
        setProgress(prev => ({ ...prev, [activeTab]: progRes.data }));
      } catch { /* silent */ }
    };
    load();
  }, [activeTab]);

  // ── Copy shareable link ───────────────────────────────────
  const handleCopyLink = () => {
    const url = `${window.location.origin}/public/${eventId}${
      activeTab ? `?category=${activeTab}` : ''
    }`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Status color ──────────────────────────────────────────
  const statusColors = {
    ongoing:   'bg-green-100 text-green-700 border-green-200',
    upcoming:  'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-100 text-red-500 border-red-200',
  };

  const currentProgress = activeTab ? progress[activeTab] : null;

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-5xl mb-4 animate-bounce">🏆</div>
        <p className="text-lg font-semibold">Loading leaderboard...</p>
      </div>
    </div>
  );

  // ── Event not found ───────────────────────────────────────
  if (!event) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white px-6">
        <p className="text-5xl mb-4">❌</p>
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-blue-300 text-sm">This leaderboard link may be invalid or expired.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center">

            {/* Trophy */}
            <div className="text-6xl mb-4">🏆</div>

            {/* Event name */}
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
              {event.name}
            </h1>

            {/* Event details */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-sm text-blue-200">
              <span>📅 {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {event.venue && <span>· 📍 {event.venue}</span>}
            </div>

            {/* Status + Live badge */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColors[event.status] || 'bg-gray-100 text-gray-500'}`}>
                {event.status}
              </span>

              {event.status === 'ongoing' && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              )}

              {lastUpdated && (
                <span className="text-xs text-blue-300">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                {copied ? '✅ Link Copied!' : '🔗 Copy Shareable Link'}
              </button>

              {/* View toggle */}
              <div className="flex bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`text-sm font-medium px-4 py-2.5 transition ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-900'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`text-sm font-medium px-4 py-2.5 transition ${
                    viewMode === 'chart'
                      ? 'bg-white text-blue-900'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  📊 Chart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      {categories.length > 1 && (
        <div className="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveTab(cat._id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${
                  activeTab === cat._id
                    ? 'bg-white text-blue-900 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Progress bar */}
        {currentProgress && currentProgress.judgeCount > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/10 p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-white/70 font-medium">Scoring Progress</p>
              <p className="text-sm text-white font-bold">
                {currentProgress.judgeCount} judge{currentProgress.judgeCount !== 1 ? 's' : ''} scoring
              </p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-700"
                style={{ width: currentProgress.scoreCount > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        {categoryResults.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                label: 'Leader',
                value: categoryResults[0]?.participant?.name?.split(' ')[0] || '—',
                icon: '🥇',
                color: 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30',
              },
              {
                label: 'Top Score',
                value: categoryResults[0]?.totalScore?.toFixed(2) || '—',
                icon: '⭐',
                color: 'from-blue-500/20 to-indigo-500/20 border-blue-400/30',
              },
              {
                label: 'Participants',
                value: categoryResults.length,
                icon: '👥',
                color: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
              },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} backdrop-blur rounded-2xl border p-4 text-center`}>
                <p className="text-xl mb-1">{icon}</p>
                <p className="text-lg sm:text-2xl font-black text-white truncate">{value}</p>
                <p className="text-xs text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chart view */}
        {viewMode === 'chart' && categoryResults.length > 1 && (
          <div className="mb-6">
            <PublicLeaderboardChart results={categoryResults} />
          </div>
        )}

        {/* Results list */}
        {viewMode === 'list' && (
          <>
            {categoryResults.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p className="text-6xl mb-4">🏆</p>
                <p className="text-xl font-bold text-white/60">No results yet</p>
                <p className="text-sm mt-2">Results will appear here as judges submit scores</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryResults.map(result => (
                  <PublicRankCard
                    key={result._id || result.participant?._id}
                    result={result}
                    animate={flashIds.includes(result.participant?._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Chart results (when chart mode but also show mini list) */}
        {viewMode === 'chart' && categoryResults.length > 0 && (
          <div className="space-y-2 mt-6">
            {categoryResults.slice(0, 3).map(result => (
              <PublicRankCard
                key={result._id || result.participant?._id}
                result={result}
                animate={flashIds.includes(result.participant?._id)}
              />
            ))}
            {categoryResults.length > 3 && (
              <button
                onClick={() => setViewMode('list')}
                className="w-full text-center text-sm text-white/50 hover:text-white/80 py-3 transition"
              >
                + {categoryResults.length - 3} more — switch to List view
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-8 text-white/30 text-xs">
        <p>Powered by <span className="font-bold text-white/50">AESTS</span> — Automated Event Scoring & Tabulation System</p>
        <p className="mt-1">This is a public view. Scores update automatically.</p>
      </div>
    </div>
  );
};

export default PublicLeaderboard;