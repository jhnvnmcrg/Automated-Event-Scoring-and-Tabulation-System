import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';

const Navbar = () => {
  const { user }   = useSelector((s) => s.auth);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = ['superadmin', 'admin'].includes(user?.role);
  const isJudge = user?.role === 'judge';

  const navLinks = [
    { to: '/dashboard', label: '🏠 Dashboard', show: true },
    { to: '/events',    label: '📋 Events',    show: true },
    { to: '/users',     label: '👥 Users',     show: user?.role === 'superadmin' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">AESTS</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(l => l.show).map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className={`hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              user?.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
              user?.role === 'admin'      ? 'bg-blue-100 text-blue-700'     :
              user?.role === 'judge'      ? 'bg-green-100 text-green-700'   :
              'bg-gray-100 text-gray-500'
            }`}>
              {user?.role}
            </span>

            {/* User info */}
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition"
            >
              Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700 text-xl"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1 border-t pt-3">
            {navLinks.filter(l => l.show).map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;