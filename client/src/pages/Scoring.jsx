import { useEffect, useState } from 'react';
import { useParams }           from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import API                     from '../api/axios';
import ScoreInput              from '../components/judge/ScoreInput';
import { submitScores, fetchMyScores } from '../store/slices/scoreSlice';
import useSocket               from '../hooks/useSocket';
import toast                   from 'react-hot-toast';

const Scoring = () => {
  const { eventId } = useParams();
  const dispatch    = useDispatch();
  const { user }    = useSelector((state) => state.auth);
  const { submitting, myScores } = useSelector((state) => state.scores);

  // Connect to socket room
  useSocket(eventId);

  const [event,        setEvent]        = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [activeTab,    setActiveTab]    = useState(null);
  const [criteria,     setCriteria]     = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState(null);

  // Local score values: { [criterionId]: number }
  const [scoreValues, setScoreValues] = useState({});
  const [submitted,   setSubmitted]   = useState(false);

  // ── Load event & categories ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: evData } = await API.get(`/events/${eventId}`);
      setEvent(evData.event);
      const { data: catData } = await API.get(`/categories/event/${eventId}`);
      setCategories(catData.categories);
      if (catData.categories.length) setActiveTab(catData.categories[0]._id);
    };
    load();
  }, [eventId]);

  // ── Load criteria & participants on tab change ────────────
  useEffect(() => {
    if (!activeTab) return;
    const load = async () => {
      const [critRes, partRes] = await Promise.all([
        API.get(`/categories/${activeTab}/criteria`),
        API.get(`/categories/${activeTab}/participants`),
      ]);
      setCriteria(critRes.data.criteria);
      setParticipants(partRes.data.participants);
      setActiveParticipant(partRes.data.participants[0] || null);
    };
    load();
  }, [activeTab]);

  // ── Load judge's existing scores when participant changes ─
  useEffect(() => {
    if (!activeParticipant) return;

    const load = async () => {
      await dispatch(fetchMyScores(activeParticipant._id));
    };
    load();
    setSubmitted(false);
  }, [activeParticipant]);

  // ── Pre-fill score inputs from saved scores ───────────────
  useEffect(() => {
    if (!activeParticipant || !criteria.length) return;

    const saved = myScores[activeParticipant._id] || [];

    const initial = {};
    criteria.forEach((c) => {
      const found = saved.find(s => s.criterion._id === c._id);
      initial[c._id] = found ? found.value : 0;
    });
    setScoreValues(initial);

    // Mark as submitted if all criteria have scores
    setSubmitted(saved.length === criteria.length);
  }, [myScores, activeParticipant, criteria]);

  // ── Handle score change ───────────────────────────────────
  const handleScoreChange = (criterionId, value) => {
    setScoreValues((prev) => ({ ...prev, [criterionId]: value }));
    setSubmitted(false);
  };

  // ── Submit scores ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!activeParticipant) return;

    const scores = criteria.map((c) => ({
      criterionId: c._id,
      value:       scoreValues[c._id] ?? 0,
    }));

    const result = await dispatch(
      submitScores({
        participantId: activeParticipant._id,
        categoryId:    activeTab,
        eventId,
        scores,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`Scores submitted for ${activeParticipant.name}!`);
      setSubmitted(true);

      // Auto-advance to next participant
      const currentIdx = participants.findIndex(p => p._id === activeParticipant._id);
      if (currentIdx < participants.length - 1) {
        setActiveParticipant(participants[currentIdx + 1]);
      }
    } else {
      toast.error(result.payload || 'Submission failed');
    }
  };

  // ── Computed total preview ────────────────────────────────
  const previewTotal = criteria.reduce((sum, c) => {
    const val = scoreValues[c._id] ?? 0;
    return sum + (val / c.maxScore) * c.weight;
  }, 0);

  if (!event) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
        <p className="text-sm text-gray-400">
          Judge: <span className="font-medium text-gray-600">{user?.name}</span>
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b px-6 py-3 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveTab(cat._id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeTab === cat._id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex h-[calc(100vh-130px)]">

        {/* Participant List (sidebar) */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Participants
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {participants.map((p, idx) => {
              const saved    = myScores[p._id] || [];
              const isScored = saved.length === criteria.length;

              return (
                <button
                  key={p._id}
                  onClick={() => setActiveParticipant(p)}
                  className={`w-full text-left px-4 py-3 border-b transition flex items-center gap-3 ${
                    activeParticipant?._id === p._id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    {p.identifier && (
                      <p className="text-xs text-gray-400">{p.identifier}</p>
                    )}
                  </div>
                  {isScored && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scoring Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeParticipant ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-4xl mb-3">👈</p>
              <p>Select a participant to score</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">

              {/* Participant Header */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {activeParticipant.name}
                    </h3>
                    {activeParticipant.identifier && (
                      <p className="text-sm text-gray-400">{activeParticipant.identifier}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Estimated Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {previewTotal.toFixed(2)}
                      <span className="text-base font-normal text-gray-400">/100</span>
                    </p>
                  </div>
                </div>

                {submitted && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700 font-medium">
                    ✅ Scores submitted — you can still update them
                  </div>
                )}
              </div>

              {/* Criteria Inputs */}
              <div className="space-y-4 mb-6">
                {criteria.map((criterion) => (
                  <ScoreInput
                    key={criterion._id}
                    criterion={criterion}
                    value={scoreValues[criterion._id] ?? 0}
                    onChange={handleScoreChange}
                    disabled={submitting}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || criteria.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl text-lg transition"
              >
                {submitting
                  ? 'Submitting...'
                  : submitted
                  ? '🔄 Update Scores'
                  : '✅ Submit Scores'}
              </button>

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    const idx = participants.findIndex(p => p._id === activeParticipant._id);
                    if (idx > 0) setActiveParticipant(participants[idx - 1]);
                  }}
                  disabled={participants.indexOf(activeParticipant) === 0}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const idx = participants.findIndex(p => p._id === activeParticipant._id);
                    if (idx < participants.length - 1) setActiveParticipant(participants[idx + 1]);
                  }}
                  disabled={participants.indexOf(activeParticipant) === participants.length - 1}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scoring;