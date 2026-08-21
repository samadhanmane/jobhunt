const { useState, useEffect, useRef, useMemo } = React;

// Fetch VITE_BACKEND_URL strictly from .env (injected from Vercel / local .env via window.__APP_CONFIG__)
const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.VITE_BACKEND_URL) {
        return window.__APP_CONFIG__.VITE_BACKEND_URL.trim().replace(/\/+$/, '');
    }
    return '';
};

const API_BASE_URL = getApiBaseUrl();

// ==========================================
// Helper Functions
// ==========================================
function isWithinDays(dateStr, days) {
    if (!dateStr) return true;
    try {
        let jobDate;
        if (!isNaN(dateStr) && String(dateStr).length >= 10) {
            const num = Number(dateStr);
            jobDate = new Date(num > 1e11 ? num : num * 1000);
        } else {
            jobDate = new Date(dateStr);
        }
        if (isNaN(jobDate.getTime())) return true;
        const diffMs = new Date().getTime() - jobDate.getTime();
        return (diffMs / (1000 * 60 * 60 * 24)) <= days;
    } catch {
        return true;
    }
}

// ==========================================
// Main App Component
// ==========================================
function App() {
    // Auth State
    const [token, setToken] = useState(() => localStorage.getItem("jobagent_auth_token") || "");
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("jobagent_user") || "null");
        } catch {
            return null;
        }
    });

    // Active Navigation Tab: 'search' | 'alerts' | 'admin'
    const [activeTab, setActiveTab] = useState('search');

    // Notification / Toast
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4500);
    };

    // Verify token on initial load
    useEffect(() => {
        if (token) {
            fetch(`${API_BASE_URL}/api/v1/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (!res.ok) throw new Error("Invalid session");
                return res.json();
            })
            .then(data => {
                setCurrentUser(data.user);
                localStorage.setItem("jobagent_user", JSON.stringify(data.user));
            })
            .catch(() => {
                handleLogout();
            });
        }
    }, [token]);

    const handleLoginSuccess = (newToken, user) => {
        setToken(newToken);
        setCurrentUser(user);
        localStorage.setItem("jobagent_auth_token", newToken);
        localStorage.setItem("jobagent_user", JSON.stringify(user));
        showToast(`Welcome back, ${user.email}!`);
    };

    const handleLogout = () => {
        setToken("");
        setCurrentUser(null);
        localStorage.removeItem("jobagent_auth_token");
        localStorage.removeItem("jobagent_user");
        setActiveTab('search');
    };

    // If not authenticated, render Login Screen
    if (!token || !currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Navigation Header */}
            <Navbar 
                user={currentUser} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout} 
            />

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                    <div className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border text-sm font-medium ${
                        toast.type === 'error' 
                            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' 
                            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                    }`}>
                        <span>{toast.type === 'error' ? '❌' : '✅'}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'search' && (
                    <JobSearchDashboard token={token} user={currentUser} showToast={showToast} />
                )}
                {activeTab === 'alerts' && (
                    <EmailAlertsView token={token} user={currentUser} showToast={showToast} />
                )}
                {activeTab === 'admin' && currentUser.role === 'admin' && (
                    <AdminPortal token={token} user={currentUser} showToast={showToast} />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© 2026 JobAgent AI. Multi-Platform Autonomous Job Pipeline & Deduplicator.</p>
                    <div className="flex items-center gap-3">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>FastAPI + Mistral AI + React + Tailwind</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ==========================================
// Component: Login Screen
// ==========================================
function LoginScreen({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!API_BASE_URL) {
            setError("Backend URL not configured in .env (VITE_BACKEND_URL is empty).");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Authentication failed.");
            }

            onLoginSuccess(data.access_token, data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-4 animate-float">
                    <span className="text-3xl">⚡</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">
                    JobAgent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">AI</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2">Sign in to access your curated job intelligence platform</p>
            </div>

            <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {error && (
                    <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                        <span className="text-base">⚠️</span>
                        <div className="flex-1 leading-relaxed">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">✉️</span>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jobhuntadmin@gmail.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">🔒</span>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Sign In →</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// Component: Navigation Bar
// ==========================================
function Navbar({ user, activeTab, setActiveTab, onLogout }) {
    return (
        <header className="sticky top-0 z-40 glass-nav border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-xl">
                        ⚡
                    </div>
                    <div>
                        <div className="font-extrabold font-outfit text-xl text-white tracking-tight leading-none">
                            JobAgent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium tracking-wide">Multi-Platform Job Discovery</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('search')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === 'search' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                    >
                        <span>🔍</span>
                        <span>Job Search</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === 'alerts' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                    >
                        <span>⏰</span>
                        <span>Email Alerts</span>
                    </button>

                    {user.role === 'admin' && (
                        <button 
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                activeTab === 'admin' 
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                                    : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
                            }`}
                        >
                            <span>🛡️</span>
                            <span>Admin Portal</span>
                        </button>
                    )}
                </nav>

                {/* User Menu & Logout */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-slate-300 font-medium">{user.email}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                            {user.role}
                        </span>
                    </div>

                    <button 
                        onClick={onLogout}
                        title="Sign Out"
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                        <span>🚪</span>
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

// ==========================================
// Component: Job Search & Discovery Dashboard
// ==========================================
function JobSearchDashboard({ token, user, showToast }) {
    // Form Inputs
    const [role, setRole] = useState("AI ML Intern");
    const [location, setLocation] = useState("Pune");
    const [experienceLevel, setExperienceLevel] = useState("intern");
    const [remotePreference, setRemotePreference] = useState("any");

    // Resume Profile State
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeProfile, setResumeProfile] = useState(null);
    const [parsingResume, setParsingResume] = useState(false);

    // Search Execution State
    const [searching, setSearching] = useState(false);
    const [currentSearchId, setCurrentSearchId] = useState("");
    const [allJobs, setAllJobs] = useState([]);
    const [searchStats, setSearchStats] = useState({ total_found: 0, unique_count: 0 });

    // Filter Toolbar State
    const [filterKeyword, setFilterKeyword] = useState("");
    const [filterLocation, setFilterLocation] = useState("all");
    const [filterWorkMode, setFilterWorkMode] = useState("all");
    const [minScore, setMinScore] = useState(0);
    const [filterSeniority, setFilterSeniority] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [filterSource, setFilterSource] = useState("all");
    const [sortBy, setSortBy] = useState("score");

    // RAG AI Query State
    const [ragModalOpen, setRagModalOpen] = useState(false);
    const [ragQuery, setRagQuery] = useState("");
    const [ragAnswer, setRagAnswer] = useState("");
    const [ragLoading, setRagLoading] = useState(false);

    // Resume Upload & Parse
    const handleResumeChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setResumeFile(file);
        setParsingResume(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/search/parse-resume`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setResumeProfile(data.profile);
                if (data.profile.target_roles && data.profile.target_roles[0]) {
                    setRole(data.profile.target_roles[0]);
                }
                if (data.profile.seniority) {
                    const s = data.profile.seniority.toLowerCase();
                    if (s.includes("intern")) setExperienceLevel("intern");
                    else if (s.includes("junior") || s.includes("entry")) setExperienceLevel("entry");
                    else if (s.includes("senior")) setExperienceLevel("senior");
                    else if (s.includes("lead") || s.includes("staff")) setExperienceLevel("lead");
                    else setExperienceLevel("mid");
                }
                showToast(`Resume parsed! Found ${data.profile.skills?.length || 0} skills.`);
            } else {
                showToast(data.detail || "Failed to parse resume.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setParsingResume(false);
        }
    };

    // Execute Job Search
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setSearching(true);
        setAllJobs([]);

        const formData = new FormData();
        formData.append("role", role);
        formData.append("location", location);
        formData.append("experience_level", experienceLevel);
        formData.append("remote_preference", remotePreference);
        if (resumeFile) {
            formData.append("resume", resumeFile);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/search`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setCurrentSearchId(data.search_id);
                setSearchStats({
                    total_found: data.total_found || 0,
                    unique_count: data.unique_count || 0
                });
                setAllJobs(data.jobs || []);
                showToast(`Gathered ${data.total_found} raw postings -> ${data.unique_count} curated matching roles!`);
            } else {
                showToast(data.detail || "Search failed.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSearching(false);
        }
    };

    // Filter & Sort Logic
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            const title = (job.title || "").toLowerCase();
            const company = (job.company || "").toLowerCase();
            const jobLoc = (job.location || "").toLowerCase();
            const desc = (job.description || "").toLowerCase();
            const source = (job.source || "").toLowerCase();

            // 1. Keyword search
            if (filterKeyword) {
                const kw = filterKeyword.toLowerCase();
                if (!title.includes(kw) && !company.includes(kw) && !desc.includes(kw)) {
                    return false;
                }
            }

            // 2. Location Preset
            if (filterLocation === 'india' && !jobLoc.includes('india') && !jobLoc.includes('pune') && !jobLoc.includes('bangalore') && !jobLoc.includes('mumbai') && !jobLoc.includes('delhi') && !jobLoc.includes('hyderabad')) return false;
            if (filterLocation === 'us' && !jobLoc.includes('united states') && !jobLoc.includes('usa') && !jobLoc.includes('us') && !jobLoc.includes('ca') && !jobLoc.includes('ny') && !jobLoc.includes('tx')) return false;
            if (filterLocation === 'uk' && !jobLoc.includes('united kingdom') && !jobLoc.includes('uk') && !jobLoc.includes('london')) return false;
            if (filterLocation === 'remote' && !jobLoc.includes('remote') && !jobLoc.includes('wfh') && source !== 'himalayas' && jobLoc !== '') return false;

            // 3. Work Mode
            const isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || jobLoc.includes('anywhere');
            if (filterWorkMode === 'remote' && !isRemote) return false;
            if (filterWorkMode === 'onsite' && isRemote) return false;

            // 4. Min Score
            if ((job.match_score || 0) < minScore) return false;

            // 5. Seniority
            const fit = (job.experience_fit || "").toLowerCase();
            if (filterSeniority === 'intern' && !title.includes('intern') && !title.includes('trainee') && !fit.includes('intern') && !title.includes('graduate')) return false;
            if (filterSeniority === 'junior' && !title.includes('junior') && !title.includes('entry') && !title.includes('associate') && !fit.includes('junior')) return false;
            if (filterSeniority === 'senior' && !title.includes('senior') && !title.includes('lead') && !title.includes('principal') && !title.includes('staff')) return false;

            // 6. Freshness Date
            if (filterDate === '24h' && !isWithinDays(job.posted_date, 1)) return false;
            if (filterDate === '3d' && !isWithinDays(job.posted_date, 3)) return false;
            if (filterDate === '7d' && !isWithinDays(job.posted_date, 7)) return false;
            if (filterDate === '30d' && !isWithinDays(job.posted_date, 30)) return false;

            // 7. Source
            if (filterSource !== 'all' && !source.includes(filterSource)) return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
            if (sortBy === 'date') return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
            return 0;
        });
    }, [allJobs, filterKeyword, filterLocation, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

    // RAG AI Query Handler
    const handleAskAI = async (e) => {
        e?.preventDefault();
        if (!ragQuery.trim() || !currentSearchId) return;
        setRagLoading(true);
        setRagAnswer("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${currentSearchId}/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: ragQuery })
            });
            const data = await res.json();
            if (res.ok) {
                setRagAnswer(data.answer || "No response received.");
            } else {
                setRagAnswer(`Error: ${data.detail || 'Could not query assistant.'}`);
            }
        } catch (err) {
            setRagAnswer(`Error: ${err.message}`);
        } finally {
            setRagLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Search Input & Resume Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Form */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                        <div>
                            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                                <span>🎯</span> Search & Match Preferences
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Multi-platform scraping across LinkedIn, Indeed, Freehire, Himalayas & Arbeitnow</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Target Role / Title <span className="text-indigo-400">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. AI ML Intern, Full Stack Developer"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Preferred Location
                                </label>
                                <input 
                                    type="text" 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Pune india, Bangalore, Remote"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Work Mode
                                </label>
                                <select 
                                    value={remotePreference}
                                    onChange={(e) => setRemotePreference(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="any">🌐 Any (Remote + Onsite)</option>
                                    <option value="remote">🏠 Remote Only</option>
                                    <option value="onsite">🏢 Onsite / Hybrid Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Experience Level
                                </label>
                                <select 
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="intern">🎓 Internship / Fresher (0 Yrs)</option>
                                    <option value="entry">🌱 Entry Level (0 - 2 Yrs)</option>
                                    <option value="mid">⚡ Mid Level (2 - 5 Yrs)</option>
                                    <option value="senior">💼 Senior Level (5 - 8 Yrs)</option>
                                    <option value="lead">👑 Lead / Staff / Director (8+ Yrs)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={searching}
                            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                        >
                            {searching ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Harvesting & Ranking Across 5 Job Platforms...</span>
                                </>
                            ) : (
                                <span>⚡ Harvest & AI Rank Jobs Now</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Resume Upload & Profile Card */}
                <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                            <h3 className="font-bold text-white font-outfit flex items-center gap-2">
                                <span>📄</span> Resume AI Matcher
                            </h3>
                            {parsingResume && (
                                <span className="text-xs text-indigo-400 animate-pulse font-medium">Parsing...</span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Upload Resume (PDF / DOCX)
                            </label>
                            <input 
                                type="file" 
                                accept=".pdf,.docx,.txt"
                                onChange={handleResumeChange}
                                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 file:cursor-pointer cursor-pointer"
                            />
                        </div>

                        {resumeProfile ? (
                            <div className="space-y-3">
                                <div className="text-xs text-slate-400">
                                    <strong className="text-slate-200">Seniority:</strong> {resumeProfile.seniority || 'Entry Level'} | <strong className="text-slate-200">Domain:</strong> {resumeProfile.core_domain || 'Tech'}
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Extracted Skills:</div>
                                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                                        {(resumeProfile.skills || []).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-700/60 text-center text-xs text-slate-500">
                                Upload your resume to unlock AI skill matching and personalized scoring fit!
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                        <span>Protected deduplication</span>
                        <span className="text-emerald-400 font-semibold">100% Guaranteed</span>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar & Search Results Header */}
            {allJobs.length > 0 && (
                <div className="space-y-6">
                    {/* Summary Stat Banner & Export Bar */}
                    <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="text-xs text-slate-400 font-medium">Raw Gathered</div>
                                <div className="text-2xl font-black font-outfit text-white">{searchStats.total_found}</div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div>
                                <div className="text-xs text-slate-400 font-medium">Unique Deduplicated</div>
                                <div className="text-2xl font-black font-outfit text-indigo-400">{searchStats.unique_count}</div>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div>
                                <div className="text-xs text-slate-400 font-medium">Filtered Showing</div>
                                <div className="text-2xl font-black font-outfit text-emerald-400">{filteredJobs.length}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                                onClick={() => setRagModalOpen(true)}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>🤖</span>
                                <span>Ask AI (RAG Assistant)</span>
                            </button>

                            <a 
                                href={`${API_BASE_URL}/api/v1/jobs/${currentSearchId}/export`}
                                download
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>📥</span>
                                <span>Export CSV</span>
                            </a>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                            {/* Search Keyword */}
                            <div className="lg:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Search in Results</label>
                                <input 
                                    type="text"
                                    placeholder="Company, title, skill..."
                                    value={filterKeyword}
                                    onChange={(e) => setFilterKeyword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Location Preset */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Location</label>
                                <select 
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="all">📍 All Locations</option>
                                    <option value="india">🇮🇳 India</option>
                                    <option value="us">🇺🇸 United States</option>
                                    <option value="uk">🇬🇧 United Kingdom</option>
                                    <option value="remote">🏠 Remote</option>
                                </select>
                            </div>

                            {/* Work Mode */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Work Mode</label>
                                <select 
                                    value={filterWorkMode}
                                    onChange={(e) => setFilterWorkMode(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="all">🌐 Any Mode</option>
                                    <option value="remote">🏠 Remote Only</option>
                                    <option value="onsite">🏢 Onsite Only</option>
                                </select>
                            </div>

                            {/* Seniority */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Seniority</label>
                                <select 
                                    value={filterSeniority}
                                    onChange={(e) => setFilterSeniority(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="all">🎓 All Levels</option>
                                    <option value="intern">Internship</option>
                                    <option value="junior">Junior / Entry</option>
                                    <option value="senior">Senior / Lead</option>
                                </select>
                            </div>

                            {/* Min Match Score */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                                    Min Match: <span className="text-indigo-400 font-bold">{minScore}%</span>
                                </label>
                                <input 
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="10"
                                    value={minScore}
                                    onChange={(e) => setMinScore(Number(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                />
                            </div>

                            {/* Sort Mode */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Sort By</label>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="score">⭐ Highest Match</option>
                                    <option value="date">📅 Most Recent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Job Cards Grid */}
                    {filteredJobs.length === 0 ? (
                        <div className="glass-card rounded-2xl p-12 text-center border border-white/10 space-y-3">
                            <div className="text-4xl">🔍</div>
                            <h3 className="text-lg font-bold text-white">No jobs match your filter criteria</h3>
                            <p className="text-xs text-slate-400">Try resetting filters to show all gathered postings.</p>
                            <button 
                                onClick={() => {
                                    setFilterKeyword("");
                                    setFilterLocation("all");
                                    setFilterWorkMode("all");
                                    setMinScore(0);
                                    setFilterSeniority("all");
                                    setFilterDate("all");
                                    setFilterSource("all");
                                }}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredJobs.map((job, idx) => (
                                <JobCard key={job.id || idx} job={job} onQueryAI={() => {
                                    setRagQuery(`Tell me about the requirements and salary for ${job.title} at ${job.company}`);
                                    setRagModalOpen(true);
                                }} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* RAG Assistant Modal */}
            {ragModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-card rounded-2xl max-w-2xl w-full p-6 border border-white/15 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                                <span>🤖</span> RAG Job Intelligence Assistant
                            </h3>
                            <button 
                                onClick={() => setRagModalOpen(false)}
                                className="text-slate-400 hover:text-white text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAskAI} className="space-y-3">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={ragQuery}
                                    onChange={(e) => setRagQuery(e.target.value)}
                                    placeholder="Ask anything (e.g. Which companies in Pune hire AI interns?)"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none pr-24"
                                />
                                <button 
                                    type="submit"
                                    disabled={ragLoading || !ragQuery.trim()}
                                    className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
                                >
                                    {ragLoading ? "Asking..." : "Ask AI"}
                                </button>
                            </div>
                        </form>

                        {ragAnswer && (
                            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 text-slate-200 text-sm leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap">
                                {ragAnswer}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// Component: Single Job Card
// ==========================================
function JobCard({ job, onQueryAI }) {
    const score = Math.round(job.match_score || 0);
    let scoreColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (score >= 80) scoreColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    else if (score < 60) scoreColor = "bg-slate-500/20 text-slate-300 border-slate-500/30";

    // Salary formatting with strict N/A fallback
    let salaryDisplay = "💰 Salary: N/A";
    if (job.salary_range) {
        const minS = job.salary_range.min;
        const maxS = job.salary_range.max;
        const curr = job.salary_range.currency || "$";
        if (minS && maxS) salaryDisplay = `💰 ${curr}${minS.toLocaleString()} - ${maxS.toLocaleString()}`;
        else if (minS) salaryDisplay = `💰 > ${curr}${minS.toLocaleString()}`;
    }

    const matchingSkills = job.matching_skills || [];
    const missingSkills = job.missing_skills || [];

    return (
        <div className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-indigo-500/10">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="font-bold font-outfit text-white text-base leading-snug line-clamp-2">
                            {job.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <span className="font-semibold text-slate-300">🏢 {job.company || 'Unknown Company'}</span>
                            <span>•</span>
                            <span>📍 {job.location || 'Remote'}</span>
                        </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg border font-bold text-xs shrink-0 ${scoreColor}`}>
                        ★ {score}% Match
                    </span>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium">
                        🔗 {job.source || 'Aggregator'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium">
                        💼 {job.experience_fit || 'Good Fit'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium">
                        📅 {job.posted_date && job.posted_date !== 'N/A' ? job.posted_date : 'Recently Listed'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium">
                        {salaryDisplay}
                    </span>
                </div>

                {/* Skills Tags */}
                {(matchingSkills.length > 0 || missingSkills.length > 0) && (
                    <div className="space-y-1.5 pt-1">
                        {matchingSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[11px] text-emerald-400 font-semibold mr-1">Matched:</span>
                                {matchingSkills.slice(0, 4).map((s, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                                        ✓ {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Match Reason */}
                {job.match_reason && (
                    <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                        💡 {job.match_reason}
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                {job.url && (
                    <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs text-center transition-all shadow-md shadow-indigo-600/20"
                    >
                        Apply Directly ↗
                    </a>
                )}
                <button 
                    type="button" 
                    onClick={onQueryAI}
                    title="Ask AI about this role"
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                >
                    🤖 Ask AI
                </button>
            </div>
        </div>
    );
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView({ token, user, showToast }) {
    const [email, setEmail] = useState(user.email || "");
    const [role, setRole] = useState("AI ML Intern");
    const [location, setLocation] = useState("Pune");
    const [workMode, setWorkMode] = useState("any");
    const [experienceLevel, setExperienceLevel] = useState("intern");
    const [maxAgeDays, setMaxAgeDays] = useState(3);
    const [preferredTime, setPreferredTime] = useState("09:00");

    // Optional Resume State
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeProfile, setResumeProfile] = useState(null);
    const [parsingResume, setParsingResume] = useState(false);

    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);

    const fetchAlerts = async () => {
        try {
            setLoadingAlerts(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setActiveAlerts(data || []);
            }
        } catch (err) {
            console.error("Fetch alerts error:", err);
        } finally {
            setLoadingAlerts(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleResumeChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setResumeFile(file);
        setParsingResume(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/search/parse-resume`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setResumeProfile(data.profile);
                if (data.profile.target_roles && data.profile.target_roles[0]) {
                    setRole(data.profile.target_roles[0]);
                }
                if (data.profile.seniority) {
                    const s = data.profile.seniority.toLowerCase();
                    if (s.includes("intern")) setExperienceLevel("intern");
                    else if (s.includes("junior") || s.includes("entry")) setExperienceLevel("entry");
                    else if (s.includes("senior")) setExperienceLevel("senior");
                    else if (s.includes("lead") || s.includes("staff")) setExperienceLevel("lead");
                    else setExperienceLevel("mid");
                }
                showToast(`Resume attached! Extracted ${data.profile.skills?.length || 0} skills for automation matching.`);
            } else {
                showToast("Resume attached (will be indexed during search).");
            }
        } catch (err) {
            showToast("Resume attached.");
        } finally {
            setParsingResume(false);
        }
    };

    const handleSaveAlert = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("role", role);
        formData.append("location", location);
        formData.append("work_mode", workMode);
        formData.append("experience_level", experienceLevel);
        formData.append("max_age_days", maxAgeDays);
        formData.append("preferred_time", preferredTime);
        if (resumeFile) {
            formData.append("resume", resumeFile);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Daily job automation scheduled for ${email}!`);
                fetchAlerts();
            } else {
                showToast(data.detail || "Failed to schedule alert.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        setTesting(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("role", role);
        formData.append("location", location);
        formData.append("work_mode", workMode);
        formData.append("experience_level", experienceLevel);
        formData.append("max_age_days", maxAgeDays);
        if (resumeFile) {
            formData.append("resume", resumeFile);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/test-send`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && (data.status === 'success' || data.status === 'partial')) {
                showToast(`✅ Sent ${data.jobs_sent || 0} Jobs + 2 CSVs to ${email}!`);
            } else {
                showToast(data.detail || data.message || "Failed to send test email.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setTesting(false);
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast("Alert automation removed.");
                fetchAlerts();
            } else {
                showToast("Failed to delete alert.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Automation Setup Form */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 space-y-6">
                <div>
                    <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                        <span>⏰</span> Automated Daily Job Digest
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Runs scheduled multi-board scrapers with deduplication and delivers matching roles with curated CSV directly to your inbox.
                    </p>
                </div>

                <form onSubmit={handleSaveAlert} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Destination Email Address <span className="text-indigo-400">*</span>
                        </label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. xyz@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Target Role / Title <span className="text-indigo-400">*</span>
                            </label>
                            <input 
                                type="text" 
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Preferred Location
                            </label>
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Work Mode
                            </label>
                            <select 
                                value={workMode}
                                onChange={(e) => setWorkMode(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="any">🌐 Any (Remote + Onsite)</option>
                                <option value="remote">🏠 Remote Only</option>
                                <option value="onsite">🏢 Onsite Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Experience Level
                            </label>
                            <select 
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="intern">🎓 Internship / Fresher</option>
                                <option value="entry">🌱 Entry Level (0-2 Yrs)</option>
                                <option value="mid">⚡ Mid Level (2-5 Yrs)</option>
                                <option value="senior">💼 Senior Level (5-8 Yrs)</option>
                                <option value="lead">👑 Lead / Staff (8+ Yrs)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Posted Date Filter
                            </label>
                            <select 
                                value={maxAgeDays}
                                onChange={(e) => setMaxAgeDays(Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={1}>⏱️ Past 24 Hours</option>
                                <option value={3}>📅 Past 3 Days</option>
                                <option value={7}>🗓️ Past Week (7 Days)</option>
                                <option value={14}>🗓️ Past 14 Days</option>
                                <option value={30}>🗓️ Past Month (30 Days)</option>
                                <option value={0}>🌐 Any Time (All Dates)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Daily Time (24h)
                            </label>
                            <input 
                                type="time" 
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Resume Upload for Automation Skill-Matching */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-inner space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                <span>📄</span>
                                <span>Candidate Resume for Automation <span className="text-slate-400 font-normal lowercase">(optional - matches skills to job description)</span></span>
                            </label>
                            {resumeFile && (
                                <button 
                                    type="button" 
                                    onClick={() => { setResumeFile(null); setResumeProfile(null); }}
                                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                                >
                                    ✕ Remove
                                </button>
                            )}
                        </div>
                        <input 
                            type="file" 
                            accept=".pdf,.docx,.txt"
                            onChange={handleResumeChange}
                            className="block w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer transition-all"
                        />
                        {parsingResume && (
                            <p className="text-xs text-indigo-400 animate-pulse flex items-center gap-1.5">
                                <span className="inline-block w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                                <span>Parsing resume skills for automated daily matching...</span>
                            </p>
                        )}
                        {resumeProfile && (
                            <div className="mt-2 flex flex-wrap gap-1.5 items-center text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 p-2.5 rounded-xl">
                                <span className="font-bold">✓ {resumeFile?.name}</span>
                                <span className="text-emerald-400">• {resumeProfile.skills?.length || 0} skills indexed for daily matching</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving Schedule..." : "💾 Save Daily Automation"}
                        </button>

                        <button 
                            type="button" 
                            onClick={handleSendTestEmail}
                            disabled={testing}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {testing ? (
                                <>
                                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Harvesting & Sending...</span>
                                </>
                            ) : (
                                <span>⚡ Send Live Test Email & CSV Now</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Active Automations List */}
            <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 space-y-4">
                <h3 className="font-bold text-white font-outfit flex items-center justify-between pb-3 border-b border-white/5">
                    <span>📋 Active Automations</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {activeAlerts.length} Active
                    </span>
                </h3>

                {loadingAlerts ? (
                    <div className="text-center py-8 text-xs text-slate-500 animate-pulse">Loading schedules...</div>
                ) : activeAlerts.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-700/60 text-center text-xs text-slate-500">
                        No active email schedules yet. Save an alert to receive automated daily digests!
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {activeAlerts.map((alert) => (
                            <div key={alert.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-white text-xs">{alert.role}</div>
                                        <div className="text-[11px] text-slate-400">
                                            📍 {alert.location || 'Remote'} • ⏰ {alert.preferred_time} • 📅 {alert.max_age_days === 1 ? 'Past 24h' : (alert.max_age_days === 0 ? 'All Dates' : `Past ${alert.max_age_days || 1}d`)}
                                        </div>
                                        <div className="text-[10px] text-indigo-400">✉️ {alert.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        className="text-slate-500 hover:text-rose-400 text-xs p-1"
                                        title="Delete schedule"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Component: Admin User Management Portal
// ==========================================
function AdminPortal({ token, user, showToast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // New User Form
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data || []);
            } else {
                showToast(data.detail || "Failed to load users", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
                method: "POST",
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: newEmail,
                    password: newPassword,
                    role: newRole
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`User '${newEmail}' created successfully!`);
                setNewEmail("");
                setNewPassword("");
                setNewRole("user");
                fetchUsers();
            } else {
                showToast(data.detail || "Failed to create user", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/status`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message);
                fetchUsers();
            } else {
                showToast(data.detail || "Status toggle failed", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message);
                fetchUsers();
            } else {
                showToast(data.detail || "Delete user failed", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                            <span>🛡️</span> Admin User Access Control
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Only authorized user accounts created here can log in and access the system.
                        </p>
                    </div>
                </div>

                {/* Add User Form */}
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-900/60 p-4 rounded-xl border border-white/5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">User Email</label>
                        <input 
                            type="email"
                            required
                            placeholder="colleague@company.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                        <input 
                            type="text"
                            required
                            placeholder="Initial password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Assigned Role</label>
                        <select 
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="user">Candidate / Standard User</option>
                            <option value="admin">Platform Administrator</option>
                        </select>
                    </div>

                    <button 
                        type="submit"
                        disabled={creating}
                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-50"
                    >
                        {creating ? "Creating..." : "➕ Create User"}
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm font-outfit">Registered Accounts ({users.length})</h3>
                    <button onClick={fetchUsers} className="text-xs text-indigo-400 hover:underline">Refresh List</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-white/5">
                            <tr>
                                <th className="py-3 px-4">User Email</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Created Date</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02]">
                                    <td className="py-3 px-4 font-semibold text-slate-200">{u.email}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700/50 text-slate-300'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            u.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                        }`}>
                                            {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-400">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        {u.id !== user.id && (
                                            <>
                                                <button 
                                                    onClick={() => handleToggleStatus(u.id)}
                                                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                                >
                                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="px-2.5 py-1 rounded bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px]"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
