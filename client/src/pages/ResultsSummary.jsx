import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import RankBadge from "../components/leaderboard/RankBadge";
import ExportButtons from "../components/common/ExportButtons";
import Layout from "../components/common/Layout";

const ResultsSummary = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [summary, setSummary] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [evRes, sumRes] = await Promise.all([
                    API.get(`/events/${eventId}`),
                    API.get(`/results/event/${eventId}/summary`)
                ]);
                setEvent(evRes.data.event);
                setSummary(sumRes.data.summary);
            } catch {
                /* silent */
            }
            setLoading(false);
        };
        load();
    }, [eventId]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Loading summary...
            </div>
        );

    return (
        <Layout>
            {/* Header */}
            <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="text-sm text-blue-600 hover:underline mb-4 inline-block"
            >
                ← Back to Event
            </button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Results Summary
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {event?.name}
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/leaderboard/${eventId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                >
                    🏆 Full Leaderboard
                </button>
                <ExportButtons eventId={eventId} />
            </div>

            {/* Per-Category Cards */}
            {summary.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    <p className="text-5xl mb-3">📊</p>
                    <p className="text-lg font-medium">No results yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {summary.map(
                        ({ category, results, judgeCount, totalResults }) => (
                            <div
                                key={category._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                            >
                                {/* Category Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {totalResults} participant
                                            {totalResults !== 1
                                                ? "s"
                                                : ""} · {judgeCount} judge
                                            {judgeCount !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigate(`/leaderboard/${eventId}`)
                                        }
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        View all →
                                    </button>
                                </div>

                                {/* Top 3 */}
                                {results.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        No scores submitted yet
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {results.map(r => (
                                            <div
                                                key={r._id}
                                                className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                                                    r.rank === 1
                                                        ? "bg-yellow-50"
                                                        : "bg-gray-50"
                                                }`}
                                            >
                                                <RankBadge rank={r.rank} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {r.participant?.name}
                                                    </p>
                                                    {r.participant
                                                        ?.identifier && (
                                                        <p className="text-xs text-gray-400">
                                                            {
                                                                r.participant
                                                                    .identifier
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {r.totalScore?.toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}
        </Layout>
    );
};

export default ResultsSummary;
