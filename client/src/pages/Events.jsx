import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus
} from "../store/slices/eventSlice";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";

const EMPTY_FORM = {
    name: "",
    description: "",
    date: "",
    venue: "",
    status: "upcoming"
};

const STATUS_OPTIONS = ["upcoming", "ongoing", "completed", "cancelled"];

const Events = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { events, loading } = useSelector(state => state.events);
    const { user } = useSelector(state => state.auth);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const canManage = ["superadmin", "admin"].includes(user?.role);

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    const openCreate = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = event => {
        setEditTarget(event);
        setForm({
            name: event.name,
            description: event.description || "",
            date: event.date?.slice(0, 10),
            venue: event.venue || "",
            status: event.status
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.date) {
            toast.error("Name and date are required");
            return;
        }
        if (editTarget) {
            await dispatch(updateEvent({ id: editTarget._id, updates: form }));
            toast.success("Event updated!");
        } else {
            await dispatch(createEvent(form));
            toast.success("Event created!");
        }
        setShowModal(false);
    };

    const handleDelete = async id => {
        if (!window.confirm("Delete this event? This cannot be undone."))
            return;
        await dispatch(deleteEvent(id));
        toast.success("Event deleted");
    };

    const handleStatusChange = (id, status) => {
        dispatch(updateEventStatus({ id, status }));
        toast.success("Status updated");
    };

    return (
        <Layout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Events</h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {events.length} event{events.length !== 1 ? "s" : ""}{" "}
                        total
                    </p>
                </div>
                {canManage && (
                    <button
                        onClick={openCreate}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
                    >
                        + New Event
                    </button>
                )}
            </div>

            {/* Event Cards */}
            {loading ? (
                <p className="text-gray-400 text-center mt-20">
                    Loading events...
                </p>
            ) : events.length === 0 ? (
                <div className="text-center mt-20 text-gray-400">
                    <p className="text-5xl mb-4">📋</p>
                    <p className="text-lg font-medium">No events yet</p>
                    {canManage && (
                        <p className="text-sm">
                            Click "New Event" to create one
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {events.map(event => (
                        <div
                            key={event._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
                        >
                            {/* Top row */}
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-800 text-base leading-snug">
                                    {event.name}
                                </h3>
                                <StatusBadge status={event.status} />
                            </div>

                            {/* Details */}
                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                <p>
                                    📅{" "}
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                                {event.venue && <p>📍 {event.venue}</p>}
                                {event.description && (
                                    <p className="text-gray-400 line-clamp-2">
                                        {event.description}
                                    </p>
                                )}
                                <p>
                                    ⚖️ {event.assignedJudges?.length || 0}{" "}
                                    judge(s)
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() =>
                                        navigate(`/events/${event._id}`)
                                    }
                                    className="flex-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1.5 rounded-lg transition"
                                >
                                    Manage
                                </button>

                                {canManage && (
                                    <>
                                        {/* Quick status change */}
                                        <select
                                            value={event.status}
                                            onChange={e =>
                                                handleStatusChange(
                                                    event._id,
                                                    e.target.value
                                                )
                                            }
                                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>
                                                    {s.charAt(0).toUpperCase() +
                                                        s.slice(1)}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => openEdit(event)}
                                            className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(event._id)
                                            }
                                            className="text-sm bg-red-50 hover:bg-red-100 text-red-500 font-medium px-3 py-1.5 rounded-lg transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editTarget ? "Edit Event" : "Create New Event"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="e.g. Science Fair 2025"
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e =>
                                setForm({ ...form, date: e.target.value })
                            }
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Venue
                        </label>
                        <input
                            type="text"
                            value={form.venue}
                            onChange={e =>
                                setForm({ ...form, venue: e.target.value })
                            }
                            placeholder="e.g. Main Auditorium"
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    description: e.target.value
                                })
                            }
                            rows={3}
                            placeholder="Brief description of the event..."
                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition"
                        >
                            {editTarget ? "Save Changes" : "Create Event"}
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default Events;
