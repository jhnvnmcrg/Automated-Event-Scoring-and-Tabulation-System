import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">AESTS</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm">
                        {user?.name} —{" "}
                        <span className="capitalize bg-blue-500 px-2 py-0.5 rounded text-xs">
                            {user?.role}
                        </span>
                    </span>
                    <Link to="/events" className="text-sm text-white hover:text-blue-200 font-medium">
  Events
</Link>
                    <button
                        onClick={handleLogout}
                        className="bg-white text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Welcome back, {user?.name}!
                </h2>
                <p className="text-gray-500 mt-1">
                    You are logged in as{" "}
                    <span className="font-medium capitalize">{user?.role}</span>
                </p>

                {/* Role-based cards placeholder */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm">Total Events</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            0
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm">Active Judges</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            0
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
                        <p className="text-gray-500 text-sm">Participants</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
