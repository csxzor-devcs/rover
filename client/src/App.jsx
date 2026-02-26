import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* ─── Top Navigation ─── */}
            <nav className="bg-FAB_05-surface border-b border-FAB_05-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-FAB_05-cyan to-cyan-600 flex items-center justify-center text-FAB_05-bg font-bold text-sm">
                        Z
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight">FAB_05</h1>
                        <p className="text-[10px] text-FAB_05-muted font-mono uppercase tracking-widest">Delivery Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-FAB_05-bg rounded-lg p-1">
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isActive ? 'bg-FAB_05-cyan text-FAB_05-bg' : 'text-FAB_05-muted hover:text-FAB_05-text'
                            }`
                        }
                    >
                        ⚙ Admin
                    </NavLink>
                    <NavLink
                        to="/user"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isActive ? 'bg-FAB_05-cyan text-FAB_05-bg' : 'text-FAB_05-muted hover:text-FAB_05-text'
                            }`
                        }
                    >
                        � Delivery
                    </NavLink>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-FAB_05-green animate-pulse-slow" />
                    <span className="text-[10px] font-mono text-FAB_05-muted">SIMULATION</span>
                </div>
            </nav>

            <main className="flex-1">
                <Routes>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/user" element={<UserDashboard />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;

