import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/axios";
import { fetchResults, updateResults } from "../store/slices/scoreSlice";
import useSocket from "../hooks/useSocket";
import ParticipantResultCard from "../components/leaderboard/ParticipantResultCard";
import LeaderboardChart from "../components/leaderboard/LeaderboardChart";
import ScoringProgress from "../components/leaderboard/ScoringProgress";
import Layout from "../components/common/Layout";
import ShareLeaderboardButton from "../components/common/ShareLeaderboardButton";

const Leaderboard = () => {
    const { eventId } = useParams();
    const dispatch = useDispatch();
    const { results } = useSelector(state => state.scores);
    const { user } = useSelector(state => state.auth);

    const isAdmin = ["superadmin", "admin"].includes(user?.role);

    // Connect socket for live updates
    useSocket(eventId);

    const [event, setEvent] = useState(null);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [activeView, setActiveView] = useState("leaderboard"); // 'leaderboard' | 'progress'
    const [recalculating, setRecalculating] = useState(false);

    const categoryResults = activeTab ? results[activeTab] || [] : [];

    // ── Load event & categories ──────────────────────────────
    useEffect(() => {
        const load = async () => {
            const { data: evData } = await API.get(`/events/${eventId}`);
            setEvent(evData.event);
            const { data: catData } = await API.get(
                `/categories/event/${eventId}`
            );
            setCategories(catData.categories);
            if (catData.categories.length)
                setActiveTab(catData.categories[0]._id);
        };
        load();
    }, [eventId]);

    // ── Load results when tab changes ────────────────────────
    useEffect(() => {
        if (!activeTab) return;
        dispatch(fetchResults(activeTab));
    }, [activeTab, dispatch]);

    // ── Manual recalculate ───────────────────────────────────
    const handleRecalculate = async () => {
        if (!activeTab) return;
        setRecalculating(true);
        try {
            const { data } = await API.post(
                `/results/recalculate/${activeTab}`,
                {
                    eventId
                }
            );
            dispatch(
                updateResults({ categoryId: activeTab, results: data.results })
            );
        } catch {
            /* silent */
        }
        setRecalculating(false);
    };

    if (!event)
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Loading...
            </div>
        );

    return (
        <Layout>
            {/* Header */}
            <div className="bg-white border-b px-6 py-5">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {event.name}
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Live Leaderboard
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Live indicator */}
                        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </span>

                        {isAdmin && (
                            <button
                                onClick={handleRecalculate}
                                disabled={recalculating}
                                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
                            >
                                {recalculating
                                    ? "⟳ Recalculating..."
                                    : "⟳ Recalculate"}
                            </button>
                        )}
                        <ShareLeaderboardButton eventId={eventId} categoryId={activeTab} />
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-5xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveTab(cat._id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                                activeTab === cat._id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* View Switcher (admin only) */}
            {isAdmin && (
                <div className="max-w-5xl mx-auto px-6 pt-5 flex gap-2">
                    {["leaderboard", "progress"].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                                activeView === view
                                    ? "bg-gray-800 text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {view === "leaderboard"
                                ? "🏆 Leaderboard"
                                : "📊 Scoring Progress"}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-5">
                {activeView === "leaderboard" ? (
                    <>
                        {/* Summary Stats */}
                        {categoryResults.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                    <p className="text-3xl font-bold text-yellow-500">
                                        {categoryResults[0]?.participant?.name?.split(
                                            " "
                                        )[0] || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Current Leader
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {categoryResults[0]?.totalScore?.toFixed(
                                            1
                                        ) || "—"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Top Score
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                    <p className="text-3xl font-bold text-gray-700">
                                        {categoryResults.length}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Participants
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Chart */}
                        {categoryResults.length > 1 && (
                            <div className="mb-6">
                                <LeaderboardChart results={categoryResults} />
                            </div>
                        )}

                        {/* Leaderboard List */}
                        {categoryResults.length === 0 ? (
                            <div className="text-center text-gray-400 py-20">
                                <p className="text-5xl mb-3">🏆</p>
                                <p className="text-lg font-medium">
                                    No results yet
                                </p>
                                <p className="text-sm">
                                    Results appear as judges submit scores
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                        Rankings
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Click a row to see breakdown
                                    </p>
                                </div>
                                {categoryResults.map(result => (
                                    <ParticipantResultCard
                                        key={
                                            result._id ||
                                            result.participant?._id
                                        }
                                        result={result}
                                        isHighlighted={result.rank === 1}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Scoring Progress View */
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-semibold text-gray-700 mb-4">
                            Scoring Progress —{" "}
                            {categories.find(c => c._id === activeTab)?.name}
                        </h3>
                        <ScoringProgress categoryId={activeTab} />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Leaderboard;
