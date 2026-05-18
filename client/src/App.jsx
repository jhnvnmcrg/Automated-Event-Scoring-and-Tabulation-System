import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";
import Events from "./pages/Events";
import Scoring from "./pages/Scoring";
import Leaderboard from "./pages/Leaderboard";
import ResultsSummary from "./pages/ResultsSummary";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected — all authenticated users */}
                    <Route element={<ProtectedRoute />}>
                        
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/events/:id" element={<EventDetail />} />
                        <Route path="/scoring/:eventId" element={<Scoring />} />
                        <Route
                            path="/leaderboard/:eventId"
                            element={<Leaderboard />}
                        />
                        <Route
                            path="/results/:eventId"
                            element={<ResultsSummary />}
                        />
                    </Route>

                    {/* Superadmin only example */}
                    <Route
                        element={
                            <ProtectedRoute
                                allowedRoles={["superadmin", "admin", "judge"]}
                            />
                        }
                    >
                        <Route path="/scoring/:eventId" element={<Scoring />} />
                        {/* <Route path="/users" element={<Users />} /> */}
                    </Route>

                    {/* Fallback */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route
                        path="/unauthorized"
                        element={
                            <div className="flex items-center justify-center min-h-screen text-red-500 text-xl font-bold">
                                Unauthorized Access
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

export default App;
