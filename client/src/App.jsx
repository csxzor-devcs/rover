import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* ─── Top Navigation ─── */}
            <nav className="bg-zephyra-surface border-b border-zephyra-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zephyra-cyan to-cyan-600 flex items-center justify-center text-zephyra-bg font-bold text-sm">
                        Z
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight">Zephyra</h1>
                        <p className="text-[10px] text-zephyra-muted font-mono uppercase tracking-widest">Delivery Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-zephyra-bg rounded-lg p-1">
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isActive ? 'bg-zephyra-cyan text-zephyra-bg' : 'text-zephyra-muted hover:text-zephyra-text'
                            }`
                        }
                    >
                        ⚙ Admin
                    </NavLink>
                    <NavLink
                        to="/user"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isActive ? 'bg-zephyra-cyan text-zephyra-bg' : 'text-zephyra-muted hover:text-zephyra-text'
                            }`
                        }
                    >
                        � Delivery
                    </NavLink>
                </div>

                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zephyra-green animate-pulse-slow" />
                    <span className="text-[10px] font-mono text-zephyra-muted">SIMULATION</span>
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
