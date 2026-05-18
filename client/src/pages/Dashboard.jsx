import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchEvents } from '../store/slices/eventSlice';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import StatusBadge from '../components/common/StatusBadge';

const Dashboard = () => {
  const { user }   = useSelector((state) => state.auth);
  const { events } = useSelector((state) => state.events);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      API.get('/auth/users')
        .then(({ data }) => setUserCount(data.users.length))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const ongoingEvents   = events.filter(e => e.status === 'ongoing');
  const upcomingEvents  = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AESTS</h1>
        <div className="flex items-center gap-5">
          <Link to="/events"      className="text-sm hover:text-blue-200 font-medium">Events</Link>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-500 mt-1 capitalize">
            Role: <span className="font-medium">{user?.role}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events',    value: events.length,          color: 'border-blue-500' },
            { label: 'Ongoing',         value: ongoingEvents.length,   color: 'border-green-500' },
            { label: 'Upcoming',        value: upcomingEvents.length,  color: 'border-yellow-500' },
            { label: 'Completed',       value: completedEvents.length, color: 'border-gray-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color}`}>
              <p className="text-gray-400 text-sm">{label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Recent Events</h3>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No events yet</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{event.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                      {event.venue && ` · ${event.venue}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={event.status} />
                    <div className="flex gap-2">
                      {event.status === 'ongoing' && (
                        <button
                          onClick={() => navigate(`/leaderboard/${event._id}`)}
                          className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium px-3 py-1 rounded-lg"
                        >
                          🏆 Live
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-lg"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/events')}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="font-semibold text-gray-800">Manage Events</p>
            <p className="text-xs text-gray-400 mt-1">Create and manage events</p>
          </button>

          {ongoingEvents.length > 0 && (
            <button
              onClick={() => navigate(`/leaderboard/${ongoingEvents[0]._id}`)}
              className="bg-white rounded-xl border border-yellow-200 shadow-sm p-5 text-left hover:shadow-md transition"
            >
              <p className="text-2xl mb-2">🏆</p>
              <p className="font-semibold text-gray-800">Live Leaderboard</p>
              <p className="text-xs text-gray-400 mt-1">{ongoingEvents[0].name}</p>
            </button>
          )}

          {['judge', 'admin', 'superadmin'].includes(user?.role) &&
            ongoingEvents.length > 0 && (
            <button
              onClick={() => navigate(`/scoring/${ongoingEvents[0]._id}`)}
              className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 text-left hover:shadow-md transition"
            >
              <p className="text-2xl mb-2">🎯</p>
              <p className="font-semibold text-gray-800">Score Now</p>
              <p className="text-xs text-gray-400 mt-1">{ongoingEvents[0].name}</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;