import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Scoring from "./pages/Scoring";
import Leaderboard from "./pages/Leaderboard";
import ResultsSummary from "./pages/ResultsSummary";
import UserManagement from "./pages/UserManagement";
import PublicLeaderboard from "./pages/PublicLeaderboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{ duration: 3000 }}
                />
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/public/:eventId" element={<PublicLeaderboard />} />

                    {/* All authenticated users */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route
                            path="/leaderboard/:eventId"
                            element={<Leaderboard />}
                        />
                    </Route>

                    {/* Judges + Admins */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["superadmin", "admin", "judge"]}
                            />
                        }
                    >
                        <Route path="/scoring/:eventId" element={<Scoring />} />
                    </Route>

                    {/* Admins only */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["superadmin", "admin"]}
                            />
                        }
                    >
                        <Route
                            path="/results/:eventId"
                            element={<ResultsSummary />}
                        />
                    </Route>

                    {/* Superadmin only */}
                    <Route
                        element={
                            <ProtectedRoute allowedRoles={["superadmin"]} />
                        }
                    >
                        <Route path="/users" element={<UserManagement />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route
                        path="/unauthorized"
                        element={
                            <div className="flex flex-col items-center justify-center min-h-screen gap-3">
                                <p className="text-5xl">⛔</p>
                                <p className="text-xl font-bold text-red-500">
                                    Unauthorized Access
                                </p>
                                <a
                                    href="/dashboard"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    Go to Dashboard
                                </a>
                            </div>
                        }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
