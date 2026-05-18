import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const canManage = ['superadmin', 'admin'].includes(user?.role);

  const [event,        setEvent]        = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [activeTab,    setActiveTab]    = useState(null); // selected category id
  const [criteria,     setCriteria]     = useState([]);
  const [participants, setParticipants] = useState([]);

  // Modals
  const [catModal,  setCatModal]  = useState(false);
  const [critModal, setCritModal] = useState(false);
  const [partModal, setPartModal] = useState(false);

  // Edit targets
  const [editCat,  setEditCat]  = useState(null);
  const [editCrit, setEditCrit] = useState(null);
  const [editPart, setEditPart] = useState(null);

  // Forms
  const [catForm,  setCatForm]  = useState({ name: '', description: '' });
  const [critForm, setCritForm] = useState({ name: '', description: '', maxScore: '', weight: '' });
  const [partForm, setPartForm] = useState({ name: '', identifier: '', order: 0 });

  // ── Load event & categories ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: evData } = await API.get(`/events/${id}`);
      setEvent(evData.event);
      const { data: catData } = await API.get(`/categories/event/${id}`);
      setCategories(catData.categories);
      if (catData.categories.length > 0) setActiveTab(catData.categories[0]._id);
    };
    load();
  }, [id]);

  // ── Load criteria & participants on tab change ───────────
  useEffect(() => {
    if (!activeTab) return;
    const load = async () => {
      const [critRes, partRes] = await Promise.all([
        API.get(`/categories/${activeTab}/criteria`),
        API.get(`/categories/${activeTab}/participants`),
      ]);
      setCriteria(critRes.data.criteria);
      setParticipants(partRes.data.participants);
    };
    load();
  }, [activeTab]);

  // ── Category CRUD ─────────────────────────────────────────
  const handleCatSubmit = async () => {
    if (!catForm.name) return toast.error('Category name required');
    if (editCat) {
      const { data } = await API.put(`/categories/${editCat._id}`, catForm);
      setCategories(categories.map(c => c._id === editCat._id ? data.category : c));
      toast.success('Category updated');
    } else {
      const { data } = await API.post('/categories', { ...catForm, event: id });
      setCategories([...categories, data.category]);
      setActiveTab(data.category._id);
      toast.success('Category added');
    }
    setCatModal(false);
  };

  const handleCatDelete = async (catId) => {
    if (!window.confirm('Delete this category and all its data?')) return;
    await API.delete(`/categories/${catId}`);
    const updated = categories.filter(c => c._id !== catId);
    setCategories(updated);
    setActiveTab(updated[0]?._id || null);
    toast.success('Category deleted');
  };

  // ── Criterion CRUD ────────────────────────────────────────
  const handleCritSubmit = async () => {
    if (!critForm.name || !critForm.maxScore || !critForm.weight)
      return toast.error('Name, max score, and weight are required');
    if (editCrit) {
      const { data } = await API.put(`/categories/criteria/${editCrit._id}`, critForm);
      setCriteria(criteria.map(c => c._id === editCrit._id ? data.criterion : c));
      toast.success('Criterion updated');
    } else {
      const { data } = await API.post('/categories/criteria', {
        ...critForm,
        category: activeTab,
      });
      setCriteria([...criteria, data.criterion]);
      toast.success('Criterion added');
    }
    setCritModal(false);
  };

  const handleCritDelete = async (critId) => {
    await API.delete(`/categories/criteria/${critId}`);
    setCriteria(criteria.filter(c => c._id !== critId));
    toast.success('Criterion deleted');
  };

  // ── Participant CRUD ──────────────────────────────────────
  const handlePartSubmit = async () => {
    if (!partForm.name) return toast.error('Participant name required');
    if (editPart) {
      const { data } = await API.put(`/categories/participants/${editPart._id}`, partForm);
      setParticipants(participants.map(p => p._id === editPart._id ? data.participant : p));
      toast.success('Participant updated');
    } else {
      const { data } = await API.post('/categories/participants', {
        ...partForm,
        category: activeTab,
        event: id,
      });
      setParticipants([...participants, data.participant]);
      toast.success('Participant added');
    }
    setPartModal(false);
  };

  const handlePartDelete = async (partId) => {
    await API.delete(`/categories/participants/${partId}`);
    setParticipants(participants.filter(p => p._id !== partId));
    toast.success('Participant deleted');
  };

  // ── Helpers ───────────────────────────────────────────────
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);

  if (!event) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading event...
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Back + Event Header */}
      <button
        onClick={() => navigate('/events')}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Events
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{event.name}</h2>
            <p className="text-gray-500 text-sm mt-1">
              📅 {new Date(event.date).toLocaleDateString()}
              {event.venue && ` · 📍 ${event.venue}`}
            </p>
            {event.description && (
              <p className="text-gray-400 text-sm mt-1">{event.description}</p>
            )}
          </div>
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveTab(cat._id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeTab === cat._id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {canManage && (
          <button
            onClick={() => { setEditCat(null); setCatForm({ name: '', description: '' }); setCatModal(true); }}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* No categories */}
      {categories.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-5xl mb-3">📂</p>
          <p className="text-lg font-medium">No categories yet</p>
          {canManage && <p className="text-sm">Click "+ Add Category" to begin</p>}
        </div>
      )}

      {/* Active Category Content */}
      {activeTab && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Criteria Panel ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Scoring Criteria</h3>
                <p className={`text-xs mt-0.5 ${totalWeight === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                  Total weight: {totalWeight}% {totalWeight !== 100 && '(should be 100%)'}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => { setEditCrit(null); setCritForm({ name: '', description: '', maxScore: '', weight: '' }); setCritModal(true); }}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition"
                >
                  + Add
                </button>
              )}
            </div>

            {criteria.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No criteria yet</p>
            ) : (
              <div className="space-y-2">
                {criteria.map((crit) => (
                  <div key={crit._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{crit.name}</p>
                      <p className="text-xs text-gray-400">Max: {crit.maxScore} · Weight: {crit.weight}%</p>
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditCrit(crit); setCritForm({ name: crit.name, description: crit.description || '', maxScore: crit.maxScore, weight: crit.weight }); setCritModal(true); }}
                          className="text-xs text-gray-500 hover:text-blue-600"
                        >Edit</button>
                        <button
                          onClick={() => handleCritDelete(crit._id)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Participants Panel ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Participants</h3>
                <p className="text-xs text-gray-400 mt-0.5">{participants.length} registered</p>
              </div>
              {canManage && (
                <button
                  onClick={() => { setEditPart(null); setPartForm({ name: '', identifier: '', order: 0 }); setPartModal(true); }}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition"
                >
                  + Add
                </button>
              )}
            </div>

            {participants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No participants yet</p>
            ) : (
              <div className="space-y-2">
                {participants.map((part, idx) => (
                  <div key={part._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{part.name}</p>
                        {part.identifier && (
                          <p className="text-xs text-gray-400">{part.identifier}</p>
                        )}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditPart(part); setPartForm({ name: part.name, identifier: part.identifier || '', order: part.order }); setPartModal(true); }}
                          className="text-xs text-gray-500 hover:text-blue-600"
                        >Edit</button>
                        <button
                          onClick={() => handlePartDelete(part._id)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit category row */}
          {canManage && (
            <div className="lg:col-span-2 flex gap-3">
              <button
                onClick={() => {
                  const cat = categories.find(c => c._id === activeTab);
                  setEditCat(cat);
                  setCatForm({ name: cat.name, description: cat.description || '' });
                  setCatModal(true);
                }}
                className="text-sm text-gray-500 hover:text-blue-600 underline"
              >
                Edit this category
              </button>
              <button
                onClick={() => handleCatDelete(activeTab)}
                className="text-sm text-gray-500 hover:text-red-500 underline"
              >
                Delete this category
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Category Modal ── */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Best in Science" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setCatModal(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCatSubmit} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700">
              {editCat ? 'Save' : 'Add Category'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Criterion Modal ── */}
      <Modal isOpen={critModal} onClose={() => setCritModal(false)} title={editCrit ? 'Edit Criterion' : 'Add Criterion'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <input value={critForm.name} onChange={e => setCritForm({ ...critForm, name: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Presentation" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Max Score *</label>
              <input type="number" value={critForm.maxScore} onChange={e => setCritForm({ ...critForm, maxScore: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Weight (%) *</label>
              <input type="number" value={critForm.weight} onChange={e => setCritForm({ ...critForm, weight: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea value={critForm.description} onChange={e => setCritForm({ ...critForm, description: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setCritModal(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleCritSubmit} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700">
              {editCrit ? 'Save' : 'Add Criterion'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Participant Modal ── */}
      <Modal isOpen={partModal} onClose={() => setPartModal(false)} title={editPart ? 'Edit Participant' : 'Add Participant'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <input value={partForm.name} onChange={e => setPartForm({ ...partForm, name: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Juan dela Cruz" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">ID / Code</label>
            <input value={partForm.identifier} onChange={e => setPartForm({ ...partForm, identifier: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2024-001" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Presentation Order</label>
            <input type="number" value={partForm.order} onChange={e => setPartForm({ ...partForm, order: Number(e.target.value) })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setPartModal(false)} className="flex-1 border border-gray-300 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handlePartSubmit} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700">
              {editPart ? 'Save' : 'Add Participant'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetail;