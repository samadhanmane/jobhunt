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
    if (!dateStr || days === 0) return true;
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

function cleanHtmlJobDescription(rawHtml) {
    if (!rawHtml) return "No full description available.";
    if (typeof rawHtml !== 'string') return String(rawHtml);
    
    // If no HTML tags present, return clean plain text
    if (!rawHtml.includes("<") && !rawHtml.includes(">")) {
        return rawHtml.trim();
    }
    
    try {
        let text = rawHtml;
        // Strip dangerous / irrelevant tags
        text = text.replace(/<(script|style|svg|iframe|head|meta|noscript)[^>]*>.*?<\/\1>/gi, '');
        // Preserve line breaks for block elements
        text = text.replace(/<br\s*[\/]?>/gi, '\n');
        text = text.replace(/<li[^>]*>/gi, '\n• ');
        text = text.replace(/<\/li>/gi, '');
        text = text.replace(/<(h[1-6])[^>]*>/gi, '\n\n');
        text = text.replace(/<\/(h[1-6])>/gi, '\n');
        text = text.replace(/<\/(p|div|ul|ol|table|tr|section|article)>/gi, '\n\n');
        text = text.replace(/<(p|div|ul|ol|table|tr|section|article)[^>]*>/gi, '\n');
        
        // Strip remaining HTML tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        let cleaned = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean multiple blank lines
        const lines = cleaned.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim());
        const result = [];
        let prevBlank = false;
        for (const line of lines) {
            if (!line) {
                if (!prevBlank) {
                    result.push('');
                    prevBlank = true;
                }
            } else {
                result.push(line);
                prevBlank = false;
            }
        }
        return result.join('\n').trim();
    } catch {
        return rawHtml.replace(/<[^>]*>/g, ' ').trim();
    }
}

// ==========================================
// Smart Location NLP Aliases Dictionary
// ==========================================
const LOCATION_ALIASES = {
    'india': ['india', 'pune', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'noida', 'gurgaon', 'gurugram', 'chennai', 'kolkata', 'in'],
    'pune': ['pune', 'maharashtra', 'india'],
    'bangalore': ['bangalore', 'bengaluru', 'karnataka', 'india'],
    'bengaluru': ['bangalore', 'bengaluru', 'karnataka', 'india'],
    'mumbai': ['mumbai', 'maharashtra', 'bombay', 'india'],
    'hyderabad': ['hyderabad', 'telangana', 'secunderabad', 'india'],
    'delhi': ['delhi', 'noida', 'gurgaon', 'gurugram', 'ncr', 'india'],
    'noida': ['noida', 'delhi', 'ncr', 'india'],
    'gurgaon': ['gurgaon', 'gurugram', 'delhi', 'ncr', 'india'],
    'chennai': ['chennai', 'madras', 'tamil nadu', 'india'],
    'us': ['united states', 'usa', 'us', 'san francisco', 'new york', 'california', 'texas', 'seattle', 'austin', 'boston', 'chicago', 'ca', 'ny', 'tx', 'wa', 'ma'],
    'usa': ['united states', 'usa', 'us', 'san francisco', 'new york', 'california', 'texas', 'seattle', 'austin', 'boston', 'chicago', 'ca', 'ny', 'tx', 'wa', 'ma'],
    'united states': ['united states', 'usa', 'us', 'san francisco', 'new york', 'california', 'texas', 'seattle', 'austin', 'boston', 'chicago', 'ca', 'ny', 'tx', 'wa', 'ma'],
    'california': ['california', 'ca', 'san francisco', 'sf', 'bay area', 'silicon valley', 'san jose', 'palo alto', 'mountain view', 'sunnyvale', 'oakland', 'los angeles', 'la', 'san diego'],
    'bay area': ['bay area', 'san francisco', 'sf', 'silicon valley', 'san jose', 'palo alto', 'mountain view', 'sunnyvale', 'oakland', 'ca'],
    'san francisco': ['san francisco', 'sf', 'bay area', 'silicon valley', 'ca'],
    'new york': ['new york', 'ny', 'nyc', 'manhattan', 'brooklyn'],
    'texas': ['texas', 'tx', 'austin', 'dallas', 'houston'],
    'austin': ['austin', 'texas', 'tx'],
    'seattle': ['seattle', 'wa', 'washington'],
    'uk': ['united kingdom', 'uk', 'london', 'manchester', 'cambridge', 'edinburgh', 'birmingham', 'bristol', 'england', 'gb'],
    'united kingdom': ['united kingdom', 'uk', 'london', 'manchester', 'cambridge', 'edinburgh', 'birmingham', 'bristol', 'england', 'gb'],
    'london': ['london', 'uk', 'england'],
    'germany': ['germany', 'de', 'berlin', 'munich', 'münchen', 'frankfurt', 'hamburg', 'cologne'],
    'berlin': ['berlin', 'germany'],
    'munich': ['munich', 'münchen', 'germany', 'de'],
    'canada': ['canada', 'ca', 'toronto', 'ontario', 'vancouver', 'bc', 'montreal', 'quebec', 'ottawa'],
    'toronto': ['toronto', 'ontario', 'canada'],
    'vancouver': ['vancouver', 'bc', 'canada'],
    'australia': ['australia', 'au', 'sydney', 'melbourne', 'brisbane'],
    'singapore': ['singapore', 'sg'],
    'netherlands': ['netherlands', 'amsterdam', 'rotterdam', 'nl'],
    'amsterdam': ['amsterdam', 'netherlands', 'nl'],
    'uae': ['united arab emirates', 'uae', 'dubai', 'abu dhabi'],
    'dubai': ['dubai', 'uae', 'united arab emirates'],
    'europe': ['europe', 'eu', 'emea', 'germany', 'uk', 'france', 'netherlands', 'spain', 'poland', 'switzerland', 'sweden', 'ireland'],
    'apac': ['apac', 'asia', 'singapore', 'india', 'japan', 'australia', 'hong kong', 'taiwan', 'korea'],
    'remote': ['remote', 'wfh', 'work from home', 'anywhere', 'worldwide', 'virtual', 'distributed']
};

// ==========================================
// Main App Component
// ==========================================
function App() {
    const [token, setToken] = useState(() => localStorage.getItem("jobagent_auth_token") || "");
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("jobagent_user") || "null");
        } catch {
            return null;
        }
    });

    const [activeTab, setActiveTab] = useState('search');

    // LinkedIn Cookie State
    const [cookieModalOpen, setCookieModalOpen] = useState(false);
    const [cookieStatusInfo, setCookieStatusInfo] = useState({
        has_cookie: false,
        cookie_status: 'unconfigured',
        valid: false,
        message: ''
    });

    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Check cookie status on login / session load
    const refreshCookieStatus = () => {
        if (!token) return;
        fetch(`${API_BASE_URL}/api/v1/auth/linkedin-cookie-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data) {
                setCookieStatusInfo(data);
                // If cookie expired, trigger modal popup automatically
                if (data.cookie_status === 'expired') {
                    showToast("⚠️ Your LinkedIn cookie has expired. Please update it.", "error");
                }
            }
        })
        .catch(() => {});
    };

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
                refreshCookieStatus();
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
        setTimeout(refreshCookieStatus, 500);
    };

    const handleLogout = () => {
        setToken("");
        setCurrentUser(null);
        localStorage.removeItem("jobagent_auth_token");
        localStorage.removeItem("jobagent_user");
        setActiveTab('search');
    };

    if (!token || !currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Minimal Nav Header */}
            <Navbar 
                user={currentUser} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                cookieStatusInfo={cookieStatusInfo}
                onOpenCookieModal={() => setCookieModalOpen(true)}
                onLogout={handleLogout} 
            />

            {/* Cookie Expiry Banner if Expired */}
            {cookieStatusInfo.cookie_status === 'expired' && (
                <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-2 text-center text-xs text-rose-200 flex items-center justify-center gap-2">
                    <span>⚠️</span>
                    <span><strong>Action Required:</strong> Your LinkedIn session cookie has expired.</span>
                    <button 
                        onClick={() => setCookieModalOpen(true)}
                        className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-900 text-white font-semibold underline"
                    >
                        Update Cookie Now &rarr;
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
                    <div className={`px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 border text-xs font-medium ${
                        toast.type === 'error' 
                            ? 'bg-rose-950/90 border-rose-500/30 text-rose-200' 
                            : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                    }`}>
                        <span>{toast.type === 'error' ? '✕' : '✓'}</span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'search' && (
                    <JobSearchDashboard 
                        token={token} 
                        user={currentUser} 
                        cookieStatusInfo={cookieStatusInfo}
                        onOpenCookieModal={() => setCookieModalOpen(true)}
                        showToast={showToast} 
                    />
                )}
                {activeTab === 'alerts' && (
                    <EmailAlertsView 
                        token={token} 
                        user={currentUser} 
                        cookieStatusInfo={cookieStatusInfo}
                        onOpenCookieModal={() => setCookieModalOpen(true)}
                        showToast={showToast} 
                    />
                )}
                {activeTab === 'admin' && currentUser.role === 'admin' && (
                    <AdminPortal token={token} user={currentUser} showToast={showToast} />
                )}
            </main>

            {/* LinkedIn Cookie Modal */}
            {cookieModalOpen && (
                <LinkedInCookieModal 
                    token={token}
                    cookieStatusInfo={cookieStatusInfo}
                    onClose={() => setCookieModalOpen(false)}
                    onStatusUpdated={(newStatus) => {
                        setCookieStatusInfo(newStatus);
                    }}
                    showToast={showToast}
                />
            )}

            {/* Minimal Footer */}
            <footer className="border-t border-white/[0.06] py-5 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© 2026 JobAgent AI. Multi-Platform Intelligence, ATS Scrapers & Verified Contact Discovery.</p>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Multi-Source Parallel Scraping Engine Active</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ==========================================
// Component: Minimal Navigation Bar
// ==========================================
function Navbar({ user, activeTab, setActiveTab, cookieStatusInfo, onOpenCookieModal, onLogout }) {
    let cookieBadge = {
        label: "Add LinkedIn Cookie",
        color: "bg-slate-800 text-slate-400 border-white/10 hover:border-slate-500",
        dot: "bg-slate-500"
    };

    if (cookieStatusInfo?.cookie_status === 'active') {
        cookieBadge = {
            label: "LinkedIn: Active",
            color: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50",
            dot: "bg-emerald-400"
        };
    } else if (cookieStatusInfo?.cookie_status === 'expired') {
        cookieBadge = {
            label: "LinkedIn: Expired ⚠️",
            color: "bg-rose-950/80 text-rose-300 border-rose-500/40 hover:border-rose-500 animate-pulse",
            dot: "bg-rose-500"
        };
    }

    return (
        <header className="sticky top-0 z-40 minimal-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
                        ⚡
                    </div>
                    <div>
                        <div className="font-bold text-base text-slate-100 tracking-tight leading-none">
                            JobAgent <span className="text-indigo-400 font-semibold">AI</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium tracking-wide">Multi-Source ATS & Talent Discovery</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/[0.08]">
                    <button 
                        onClick={() => setActiveTab('search')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                            activeTab === 'search' 
                                ? 'bg-indigo-600/90 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                    >
                        <span>🔍</span>
                        <span>Job Search</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                            activeTab === 'alerts' 
                                ? 'bg-indigo-600/90 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                    >
                        <span>⏰</span>
                        <span>Email Alerts</span>
                    </button>

                    {user.role === 'admin' && (
                        <button 
                            onClick={() => setActiveTab('admin')}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                activeTab === 'admin' 
                                    ? 'bg-slate-700 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                            }`}
                        >
                            <span>🛡️</span>
                            <span>Admin Portal</span>
                        </button>
                    )}
                </nav>

                {/* User Menu, LinkedIn Cookie Button & Logout */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* LinkedIn Cookie Status Pill */}
                    <button 
                        onClick={onOpenCookieModal}
                        title="Configure your LinkedIn session cookie for authenticated recruiter scraping"
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${cookieBadge.color}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${cookieBadge.dot}`}></span>
                        <span className="hidden sm:inline">{cookieBadge.label}</span>
                        <span className="sm:hidden">LinkedIn</span>
                    </button>

                    <div className="hidden md:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs">
                        <span className="text-slate-300 font-medium">{user.email}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                        }`}>
                            {user.role}
                        </span>
                    </div>

                    <button 
                        onClick={onLogout}
                        title="Sign Out"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-medium transition-all"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

// ==========================================
// Component: LinkedIn Cookie Modal
// ==========================================
function LinkedInCookieModal({ token, cookieStatusInfo, onClose, onStatusUpdated, showToast }) {
    const [cookieInput, setCookieInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [statusMsg, setStatusMsg] = useState(cookieStatusInfo?.message || "");
    const [currentStatus, setCurrentStatus] = useState(cookieStatusInfo?.cookie_status || "unconfigured");

    const handleSaveCookie = async (e) => {
        e.preventDefault();
        if (!cookieInput.trim()) return;

        setSaving(true);
        setStatusMsg("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/linkedin-cookie`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ linkedin_cookie: cookieInput.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentStatus(data.cookie_status);
                setStatusMsg(data.message);
                onStatusUpdated({
                    has_cookie: true,
                    cookie_status: data.cookie_status,
                    valid: data.valid,
                    message: data.message
                });
                if (data.valid) {
                    showToast("LinkedIn cookie saved and verified active!");
                    setTimeout(onClose, 1200);
                } else {
                    showToast(data.message || "Cookie validation failed", "error");
                }
            } else {
                showToast(data.detail || "Failed to save cookie", "error");
                setStatusMsg(data.detail || "Failed to save cookie");
            }
        } catch (err) {
            showToast(err.message, "error");
            setStatusMsg(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCheckLive = async () => {
        setTesting(true);
        setStatusMsg("");
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/linkedin-cookie-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCurrentStatus(data.cookie_status);
                setStatusMsg(data.message);
                onStatusUpdated(data);
                showToast(data.valid ? "Cookie is active!" : data.message, data.valid ? "success" : "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setTesting(false);
        }
    };

    const handleRemoveCookie = async () => {
        if (!confirm("Are you sure you want to disconnect your LinkedIn cookie?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/linkedin-cookie`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCurrentStatus("unconfigured");
                setStatusMsg("Cookie disconnected.");
                setCookieInput("");
                onStatusUpdated({
                    has_cookie: false,
                    cookie_status: 'unconfigured',
                    valid: false,
                    message: 'Cookie disconnected.'
                });
                showToast("LinkedIn cookie disconnected. Using stealth search dorking.");
            }
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="minimal-card rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4 text-xs">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm">
                            💼
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">Your LinkedIn Session Cookie</h3>
                            <p className="text-[11px] text-slate-400">Authenticated HR & Team Contact Scraping</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
                </div>

                {/* Status Callout Banner */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    currentStatus === 'active' 
                        ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200' 
                        : currentStatus === 'expired' 
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                        : 'bg-slate-900 border-white/10 text-slate-300'
                }`}>
                    <span className="text-base">{currentStatus === 'active' ? '✓' : (currentStatus === 'expired' ? '⚠️' : 'ℹ️')}</span>
                    <div className="flex-1 space-y-0.5">
                        <div className="font-bold text-xs capitalize">
                            Status: {currentStatus === 'active' ? 'Active & Authenticated' : (currentStatus === 'expired' ? 'Expired (Action Required)' : 'Unconfigured / Stealth Mode')}
                        </div>
                        <div className="text-[11px] opacity-90 leading-relaxed">
                            {statusMsg || (currentStatus === 'active' 
                                ? 'Your LinkedIn cookie is verified and active for live candidate searches.' 
                                : 'Without a cookie, the system uses public search dorking. Adding your cookie enables direct Voyager profile extraction.')}
                        </div>
                    </div>
                </div>

                {/* Guided 3-Step Instructions */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.06] space-y-2">
                    <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                        📖 How to get your LinkedIn <code>li_at</code> cookie:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                        <li>Log in to <a href="https://www.linkedin.com" target="_blank" className="text-indigo-400 underline">LinkedIn.com</a> in your browser.</li>
                        <li>Open DevTools (<code>F12</code> or Right-click &rarr; Inspect).</li>
                        <li>Go to <strong>Application</strong> tab &rarr; <strong>Cookies</strong> &rarr; <code>https://www.linkedin.com</code>.</li>
                        <li>Find the cookie named <strong><code>li_at</code></strong> and copy its value.</li>
                    </ol>
                </div>

                {/* Form to Input Cookie */}
                <form onSubmit={handleSaveCookie} className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Paste <code>li_at</code> Cookie Value:
                        </label>
                        <input 
                            type="password"
                            required
                            placeholder="AQEDATxxxxxx..."
                            value={cookieInput}
                            onChange={(e) => setCookieInput(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button 
                            type="submit"
                            disabled={saving || !cookieInput.trim()}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            {saving ? "Verifying with LinkedIn..." : "💾 Save & Verify Cookie"}
                        </button>

                        {currentStatus !== 'unconfigured' && (
                            <button 
                                type="button"
                                onClick={handleCheckLive}
                                disabled={testing}
                                className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                            >
                                {testing ? "Checking..." : "↻ Test Health"}
                            </button>
                        )}
                    </div>
                </form>

                {/* Disconnect button if cookie is configured */}
                {cookieStatusInfo?.has_cookie && (
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Cookie is securely stored for your account.</span>
                        <button 
                            type="button" 
                            onClick={handleRemoveCookie}
                            className="text-rose-400 hover:text-rose-300 hover:underline font-medium"
                        >
                            Disconnect Cookie
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// Component: Minimal Login Screen
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
        <div className="w-full max-w-sm">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-white/10 text-xl text-indigo-400 mb-3">
                    ⚡
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    JobAgent <span className="text-indigo-400">AI</span>
                </h1>
                <p className="text-slate-400 text-xs mt-1">Multi-Source ATS Search & Contact Intelligence</p>
            </div>

            <div className="minimal-card rounded-xl p-6 shadow-xl border border-white/10">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jobhuntadmin@gmail.com"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                    >
                        {loading ? "Authenticating..." : "Sign In →"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function JobSearchDashboard({ token, user, cookieStatusInfo, onOpenCookieModal, showToast }) {
    // Form Inputs
    const [role, setRole] = useState("AI ML Engineer");

    // Resume Profile State & Persistence
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeProfile, setResumeProfile] = useState(null);
    const [parsingResume, setParsingResume] = useState(false);
    const resumeInputRef = useRef(null);

    // Search Execution State & Result Lists
    const [searching, setSearching] = useState(false);
    const [currentSearchId, setCurrentSearchId] = useState("");
    const [allMatchedJobs, setAllMatchedJobs] = useState([]);
    const [allUniqueJobs, setAllUniqueJobs] = useState([]);
    const [allRawJobs, setAllRawJobs] = useState([]);
    const [searchStats, setSearchStats] = useState({ total_found: 0, unique_count: 0 });

    // Selected Job for Detailed Modal
    const [selectedJob, setSelectedJob] = useState(null);

    // Filter Toolbar State with Saved Defaults
    const [filterKeyword, setFilterKeyword] = useState("");
    const [filterLocationInput, setFilterLocationInput] = useState("");
    const [filterExpYears, setFilterExpYears] = useState("all");
    const [filterWorkMode, setFilterWorkMode] = useState("all");
    const [minScore, setMinScore] = useState(0);
    const [filterSeniority, setFilterSeniority] = useState("all");
    const [filterDate, setFilterDate] = useState("all");
    const [filterSource, setFilterSource] = useState("all");
    const [jobScope, setJobScope] = useState("curated"); // 'curated' | 'unique' | 'raw'
    const [sortBy, setSortBy] = useState("score"); // 'score' | 'date'

    // RAG AI Query State
    const [ragModalOpen, setRagModalOpen] = useState(false);
    const [ragQuery, setRagQuery] = useState("");
    const [ragAnswer, setRagAnswer] = useState("");
    const [ragLoading, setRagLoading] = useState(false);

    // Exporting Insights CSV State
    const [exportingInsights, setExportingInsights] = useState(false);
    const [isHarvestingLive, setIsHarvestingLive] = useState(false);
    const [csvMenuOpen, setCsvMenuOpen] = useState(false);

    // Helper to persist search results in localStorage so they never disappear
    const persistSearchData = (sId, matched, unique, raw, stats) => {
        try {
            localStorage.setItem("jobhunt_cached_search", JSON.stringify({
                search_id: sId || "",
                matched: (matched || []).slice(0, 100),
                unique: (unique || []).slice(0, 400),
                raw: (raw || []).slice(0, 800),
                stats: stats || { total_found: 0, unique_count: 0 }
            }));
        } catch (e) {}
    };

    // Keep-Alive Heartbeat: Send /health ping every 50 seconds to keep Render free backend awake
    useEffect(() => {
        const keepAlivePing = () => {
            fetch(`${API_BASE_URL}/api/v1/health`, { cache: 'no-store' }).catch(() => {});
        };
        keepAlivePing();
        const pingInterval = setInterval(keepAlivePing, 50000);
        return () => clearInterval(pingInterval);
    }, []);

    // Load persisted resume, saved search results, and active filter choices on component mount
    useEffect(() => {
        try {
            const savedResume = localStorage.getItem("jobhunt_resume_profile");
            if (savedResume) {
                const parsed = JSON.parse(savedResume);
                setResumeProfile(parsed);
                if (parsed.target_roles && parsed.target_roles[0]) {
                    setRole(parsed.target_roles[0]);
                }
            }

            const savedSearch = localStorage.getItem("jobhunt_cached_search");
            if (savedSearch) {
                const parsedSearch = JSON.parse(savedSearch);
                if (parsedSearch.search_id) setCurrentSearchId(parsedSearch.search_id);
                if (parsedSearch.matched?.length) setAllMatchedJobs(parsedSearch.matched);
                if (parsedSearch.unique?.length) setAllUniqueJobs(parsedSearch.unique);
                if (parsedSearch.raw?.length) setAllRawJobs(parsedSearch.raw);
                if (parsedSearch.stats) setSearchStats(parsedSearch.stats);
            }

            const savedFilters = localStorage.getItem("jobhunt_active_filters");
            if (savedFilters) {
                const f = JSON.parse(savedFilters);
                if (f.jobScope) setJobScope(f.jobScope);
                if (f.filterKeyword !== undefined) setFilterKeyword(f.filterKeyword);
                if (f.filterLocationInput !== undefined) setFilterLocationInput(f.filterLocationInput);
                if (f.filterExpYears !== undefined) setFilterExpYears(f.filterExpYears);
                if (f.filterWorkMode !== undefined) setFilterWorkMode(f.filterWorkMode);
                if (f.minScore !== undefined) setMinScore(f.minScore);
                if (f.filterSeniority !== undefined) setFilterSeniority(f.filterSeniority);
                if (f.filterDate !== undefined) setFilterDate(f.filterDate);
                if (f.filterSource !== undefined) setFilterSource(f.filterSource);
                if (f.sortBy !== undefined) setSortBy(f.sortBy);
            }
        } catch (e) {}
    }, []);

    // Automatically persist active filter settings whenever user changes any filter
    useEffect(() => {
        try {
            localStorage.setItem("jobhunt_active_filters", JSON.stringify({
                jobScope,
                filterKeyword,
                filterLocationInput,
                filterExpYears,
                filterWorkMode,
                minScore,
                filterSeniority,
                filterDate,
                filterSource,
                sortBy
            }));
        } catch (e) {}
    }, [jobScope, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

    // Execute Search across 9 platforms directly targeted to active user filters (retains previous results until fresh ones arrive)
    const executeSearch = async (overrideFile = null, overrideRole = null, overrideLocation = null) => {
        setSearching(true);
        setIsHarvestingLive(false);

        const activeRole = (overrideRole || role || "Software Engineer").trim();
        const activeLocation = (overrideLocation !== null ? overrideLocation : filterLocationInput).trim() || "Worldwide";
        
        let activeSeniority = "mid";
        if (filterSeniority !== "all") {
            activeSeniority = filterSeniority;
        } else if (filterExpYears !== "all") {
            if (filterExpYears === "0") activeSeniority = "intern";
            else if (filterExpYears === "1" || filterExpYears === "2") activeSeniority = "entry_level";
            else if (filterExpYears === "3-5") activeSeniority = "mid";
            else if (filterExpYears === "5+" || filterExpYears === "8+") activeSeniority = "senior";
        } else if (resumeProfile?.seniority) {
            activeSeniority = resumeProfile.seniority.toLowerCase();
        }

        const activeRemote = filterWorkMode !== "all" ? filterWorkMode : "any";

        const formData = new FormData();
        formData.append("role", activeRole);
        formData.append("location", activeLocation);
        formData.append("experience_level", activeSeniority);
        formData.append("remote_preference", activeRemote);
        
        const fileToUpload = overrideFile || resumeFile;
        if (fileToUpload) {
            formData.append("resume", fileToUpload);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/search`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setCurrentSearchId(data.search_id);
                const newStats = {
                    total_found: data.total_found || 0,
                    unique_count: data.unique_count || 0
                };
                setSearchStats(newStats);
                const matched = data.jobs || [];
                const unique = data.unique_jobs || data.all_jobs || matched;
                const raw = data.raw_jobs || unique;
                
                // Overwrite with fresh search results
                setAllMatchedJobs(matched);
                setAllUniqueJobs(unique);
                setAllRawJobs(raw);

                // Save to localStorage
                persistSearchData(data.search_id, matched, unique, raw, newStats);

                // Start continuous background harvesting
                setIsHarvestingLive(true);
                showToast(`Harvested initial ${data.total_found} postings -> streaming more in background!`);
            } else {
                showToast(data.detail || "Search failed.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSearching(false);
        }
    };

    // Automatic Continuous Live Streaming Background Poller
    useEffect(() => {
        if (!currentSearchId) return;

        let pollCount = 0;
        const maxPolls = 25; // 25 polls * 2.5s = ~62s of continuous streaming

        const pollInterval = setInterval(async () => {
            pollCount++;
            if (pollCount > maxPolls) {
                clearInterval(pollInterval);
                setIsHarvestingLive(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${currentSearchId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.raw_jobs && data.raw_jobs.length > 0) {
                        const updatedStats = {
                            total_found: data.total_found || data.raw_jobs.length,
                            unique_count: data.unique_count || data.unique_jobs.length
                        };
                        setSearchStats(updatedStats);
                        setAllRawJobs(data.raw_jobs);
                        setAllUniqueJobs(data.unique_jobs || []);
                        setAllMatchedJobs(data.jobs || []);

                        // Persist live streaming updates
                        persistSearchData(currentSearchId, data.jobs, data.unique_jobs, data.raw_jobs, updatedStats);

                        // Keep modal contacts synced
                        if (data.jobs && data.jobs.length > 0) {
                            setSelectedJob(prev => {
                                if (!prev) return null;
                                const updated = data.jobs.find(j => j.id === prev.id) || (data.unique_jobs || []).find(j => j.id === prev.id);
                                return updated || prev;
                            });
                        }
                    }

                    if (data.status === 'completed' && pollCount > 4) {
                        setIsHarvestingLive(false);
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) {}
        }, 2500);

        return () => clearInterval(pollInterval);
    }, [currentSearchId]);

    // Resume Upload & Parse (Auto triggers search on upload)
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
                try {
                    localStorage.setItem("jobhunt_resume_profile", JSON.stringify(data.profile));
                } catch (err) {}

                const newRole = (data.profile.target_roles && data.profile.target_roles[0]) ? data.profile.target_roles[0] : role;
                setRole(newRole);
                showToast(`Resume parsed! Found ${data.profile.skills?.length || 0} skills. Fetching jobs...`);
                
                // Live fetch jobs matching the newly uploaded resume
                executeSearch(file, newRole);
            } else {
                showToast(data.detail || "Failed to parse resume.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setParsingResume(false);
        }
    };

    // Remove Resume and Clear Associated Search State
    const handleRemoveResume = () => {
        setResumeFile(null);
        setResumeProfile(null);
        setAllMatchedJobs([]);
        setAllUniqueJobs([]);
        setAllRawJobs([]);
        setCurrentSearchId("");
        setSearchStats({ total_found: 0, unique_count: 0 });
        try {
            localStorage.removeItem("jobhunt_resume_profile");
            localStorage.removeItem("jobhunt_cached_search");
        } catch (err) {}
        if (resumeInputRef.current) {
            resumeInputRef.current.value = "";
        }
        showToast("Resume and active results cleared. Upload a new resume to search.");
    };

    // Execute Job Search Form Submit
    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        executeSearch();
    };

    // Comprehensive Client-Side & Live Streaming CSV Exporter for Raw, Unique, Curated, or Filtered Jobs
    const exportJobsToCSV = (scope = "raw") => {
        let jobsList = [];
        let filenamePrefix = "jobhunt_jobs";
        let scopeLabel = "All Harvested";

        if (scope === "raw") {
            jobsList = allRawJobs;
            filenamePrefix = "raw_harvested_jobs";
            scopeLabel = "Raw Harvested";
        } else if (scope === "unique") {
            jobsList = allUniqueJobs;
            filenamePrefix = "unique_roles_jobs";
            scopeLabel = "Unique Roles";
        } else if (scope === "curated") {
            jobsList = allMatchedJobs;
            filenamePrefix = "curated_matched_jobs";
            scopeLabel = "Curated Matches";
        } else if (scope === "filtered") {
            jobsList = filteredJobs;
            filenamePrefix = "filtered_view_jobs";
            scopeLabel = "Filtered View";
        }

        if (!jobsList || jobsList.length === 0) {
            showToast(`No jobs available to export in ${scopeLabel}.`, "error");
            return;
        }

        const headers = [
            "Job ID",
            "Scope",
            "Job Title",
            "Company Name",
            "Location",
            "Work Mode",
            "Date Posted",
            "Source Platform",
            "Application URL",
            "Match Score (%)",
            "Experience Required",
            "Min Experience Years",
            "Seniority Level",
            "Experience Fit",
            "Matching Skills",
            "Missing Skills",
            "Salary Min",
            "Salary Max",
            "Salary Currency",
            "Key Requirements",
            "HR Contacts",
            "HR Emails",
            "Tech Contacts",
            "Tech Emails",
            "AI Cold Email Draft",
            "AI LinkedIn Note Draft",
            "Company Insights",
            "Full Job Description"
        ];

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            let str = String(val);
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = jobsList.map(j => {
            const matchingSkillsStr = Array.isArray(j.matching_skills) ? j.matching_skills.join(", ") : "";
            const missingSkillsStr = Array.isArray(j.missing_skills) ? j.missing_skills.join(", ") : "";

            const locLower = (j.location || "").toLowerCase();
            const workMode = locLower.includes("remote") ? "Remote" : (locLower.includes("hybrid") ? "Hybrid" : "Onsite");

            // Format HR Contacts
            const hrContacts = (j.hr_contacts || []).map(c => `${c.full_name || c.name || 'HR'} (${c.title || c.headline || 'Recruiter'}) [${c.email || 'N/A'}]`).join("; ");
            const hrEmails = (j.hr_contacts || []).map(c => c.email).filter(Boolean).join(", ");

            // Format Tech Contacts
            const techContacts = (j.tech_contacts || []).map(c => `${c.full_name || c.name || 'Lead'} (${c.title || c.headline || 'Tech Lead'}) [${c.email || 'N/A'}]`).join("; ");
            const techEmails = (j.tech_contacts || []).map(c => c.email).filter(Boolean).join(", ");

            // AI Outreach drafts
            const coldEmail = (j.hr_contacts && j.hr_contacts[0]?.outreach_draft?.email_body) || (j.tech_contacts && j.tech_contacts[0]?.outreach_draft?.email_body) || "";
            const linkedinNote = (j.hr_contacts && j.hr_contacts[0]?.outreach_draft?.linkedin_note) || (j.tech_contacts && j.tech_contacts[0]?.outreach_draft?.linkedin_note) || "";

            // Company insights
            const insights = j.company_insights ? JSON.stringify(j.company_insights) : "";

            return [
                escapeCSV(j.id || ""),
                escapeCSV(scopeLabel),
                escapeCSV(j.title || ""),
                escapeCSV(j.company || ""),
                escapeCSV(j.location || "Remote"),
                escapeCSV(workMode),
                escapeCSV(j.posted_date || ""),
                escapeCSV(j.source || ""),
                escapeCSV(j.url || ""),
                escapeCSV(j.match_score != null ? `${Math.round(j.match_score)}%` : "50%"),
                escapeCSV(j.experience_required || "Standard Fit"),
                escapeCSV(j.min_experience_years ?? ""),
                escapeCSV(j.seniority_level || ""),
                escapeCSV(j.experience_fit || ""),
                escapeCSV(matchingSkillsStr),
                escapeCSV(missingSkillsStr),
                escapeCSV(j.salary_range?.min ?? ""),
                escapeCSV(j.salary_range?.max ?? ""),
                escapeCSV(j.salary_range?.currency || "USD"),
                escapeCSV(j.key_requirements || ""),
                escapeCSV(hrContacts),
                escapeCSV(hrEmails),
                escapeCSV(techContacts),
                escapeCSV(techEmails),
                escapeCSV(coldEmail),
                escapeCSV(linkedinNote),
                escapeCSV(insights),
                escapeCSV(j.description || "")
            ].join(",");
        });

        const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(","), ...rows].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `${filenamePrefix}_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${jobsList.length} ${scopeLabel} jobs to CSV with full data!`);
        setCsvMenuOpen(false);
    };

    // Export Company Insights CSV
    const handleExportInsightsCSV = async () => {
        if (!currentSearchId) return;
        setExportingInsights(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${currentSearchId}/export-insights`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({
                    candidate_name: user?.email ? user.email.split("@")[0] : "Candidate",
                    candidate_skills: resumeProfile?.skills || []
                })
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `company_insights_${currentSearchId}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast("Downloaded Company Insights & Team Contacts CSV!");
            } else {
                showToast("Failed to generate insights CSV.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setExportingInsights(false);
        }
    };

    // Update job in list after contacts are fetched in modal
    const handleUpdateJobContacts = (updatedJob) => {
        setAllMatchedJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        setAllUniqueJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        setAllRawJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        setSelectedJob(updatedJob);
    };

    // Filter & Sort Logic for Selected Pool (Curated, Unique, or Raw Harvested)
    const filteredJobs = useMemo(() => {
        let sourceList = [];
        if (jobScope === 'raw') {
            sourceList = (allRawJobs && allRawJobs.length > 0) ? allRawJobs : ((allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : allMatchedJobs);
        } else if (jobScope === 'unique') {
            sourceList = (allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : ((allRawJobs && allRawJobs.length > 0) ? allRawJobs : allMatchedJobs);
        } else {
            sourceList = (allMatchedJobs && allMatchedJobs.length > 0) ? allMatchedJobs : ((allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : allRawJobs);
        }

        return (sourceList || []).filter(job => {
            if (!job) return false;
            const title = (job.title || "").toLowerCase();
            const company = (job.company || "").toLowerCase();
            const jobLoc = (job.location || "").toLowerCase();
            const desc = (job.description || "").toLowerCase();
            const source = (job.source || "").toLowerCase();
            const expReq = (job.experience_required || "").toLowerCase();
            const fit = (job.experience_fit || "").toLowerCase();

            // 1. Keyword search (Title, Company, Description, Skills)
            if (filterKeyword) {
                const kw = filterKeyword.toLowerCase().trim();
                const skillsStr = (job.matching_skills || []).join(" ").toLowerCase();
                if (!title.includes(kw) && !company.includes(kw) && !desc.includes(kw) && !skillsStr.includes(kw)) {
                    return false;
                }
            }

            // 2. Smart Location NLP / Custom Location Input
            if (filterLocationInput && filterLocationInput.trim()) {
                const locQuery = filterLocationInput.toLowerCase().trim();
                const isPresetRemote = locQuery === 'remote';
                
                if (isPresetRemote) {
                    const isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || source === 'jobicy' || source === 'remoteok' || jobLoc.includes('anywhere') || jobLoc === '';
                    if (!isRemote) return false;
                } else if (LOCATION_ALIASES[locQuery]) {
                    const aliases = LOCATION_ALIASES[locQuery];
                    const matchesAlias = aliases.some(alias => jobLoc.includes(alias));
                    if (!matchesAlias) return false;
                } else {
                    const tokens = locQuery.split(/[,\s/]+/).filter(t => t.length >= 2);
                    const matchesTokens = tokens.length > 0 ? tokens.some(t => jobLoc.includes(t)) : jobLoc.includes(locQuery);
                    if (!matchesTokens && !jobLoc.includes(locQuery)) return false;
                }
            }

            // 3. Work Mode
            const isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || source === 'jobicy' || source === 'remoteok' || jobLoc.includes('anywhere');
            if (filterWorkMode === 'remote' && !isRemote) return false;
            if (filterWorkMode === 'onsite' && isRemote) return false;

            // 4. Min Score (only applies when slider is active > 0 and not in raw scope)
            if (minScore > 0 && jobScope !== 'raw' && (job.match_score || 0) < minScore) {
                return false;
            }

            // 5. Granular Experience Level & Seniority Fit
            const minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;
            const isSeniorRole = title.includes('senior') || title.includes('sr.') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || fit.includes('senior') || fit.includes('lead') || desc.includes('5+ year') || desc.includes('6+ year') || desc.includes('7+ year') || desc.includes('8+ year') || desc.includes('4+ year') || minYears >= 4;
            const isInternRole = title.includes('intern') || title.includes('trainee') || title.includes('apprentice') || title.includes('fresher') || title.includes('student') || title.includes('co-op') || fit.includes('intern') || fit.includes('trainee') || expReq.includes('intern') || expReq.includes('0 yr') || minYears === 0;
            const isJuniorRole = (title.includes('junior') || title.includes('entry') || title.includes('associate') || title.includes('graduate') || fit.includes('entry') || fit.includes('junior') || fit.includes('graduate') || expReq.includes('1 yr') || expReq.includes('2 yr') || minYears === 1 || minYears === 2 || isInternRole) && !isSeniorRole;

            if (filterExpYears === '0' && (!isInternRole || isSeniorRole)) return false;
            if (filterExpYears === '1' && (minYears > 1 || isSeniorRole)) return false;
            if (filterExpYears === '2' && (minYears > 2 || isSeniorRole)) return false;
            if (filterExpYears === '3-5' && (minYears < 3 || minYears > 5 || isInternRole)) return false;
            if (filterExpYears === '5+' && !isSeniorRole && minYears < 5) return false;
            if (filterExpYears === '8+' && minYears < 8 && !title.includes('lead') && !title.includes('principal') && !title.includes('staff')) return false;

            // Seniority dropdown fallback
            if (filterSeniority === 'intern' && (!isInternRole || isSeniorRole)) return false;
            if (filterSeniority === 'junior' && (!isJuniorRole || isSeniorRole)) return false;
            if (filterSeniority === 'senior' && !isSeniorRole) return false;

            // 6. Freshness Date
            if (filterDate === '24h' && !isWithinDays(job.posted_date, 1)) return false;
            if (filterDate === '3d' && !isWithinDays(job.posted_date, 3)) return false;
            if (filterDate === '7d' && !isWithinDays(job.posted_date, 7)) return false;
            if (filterDate === '30d' && !isWithinDays(job.posted_date, 30)) return false;

            // 7. Source Platform
            if (filterSource !== 'all' && !source.includes(filterSource)) return false;

            return true;
        }).sort((a, b) => {
            if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
            if (sortBy === 'date') return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
            return (b.match_score || 0) - (a.match_score || 0);
        });
    }, [jobScope, allMatchedJobs, allUniqueJobs, allRawJobs, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

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
        <div className="space-y-6">
            {/* Search Input & Resume Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Simplified Search Form */}
                <div className="lg:col-span-2 minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>🎯</span> Search & Live Job Discovery
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Parallel scraping across Greenhouse, Lever, Ashby, LinkedIn, Indeed, Himalayas, Arbeitnow, Jobicy & RemoteOK
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                        Target Role / Title <span className="text-indigo-400">*</span>
                                    </label>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                                        <span>🌍</span> Worldwide Multi-Board Search
                                    </span>
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. AI ML Engineer, Full Stack Developer, Data Scientist"
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={searching}
                                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                            >
                                {searching ? (
                                    <>
                                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Harvesting Worldwide Across 9 Platforms...</span>
                                    </>
                                ) : (
                                    <span>⚡ Harvest Worldwide Jobs & Match Profile</span>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                        <span>Multi-platform deduplication & AI scoring</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Live Active
                        </span>
                    </div>
                </div>

                {/* Resume Upload, Profile & Management Card */}
                <div className="minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]">
                            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>📄</span> Active Resume Profile
                            </h3>
                            {parsingResume && (
                                <span className="text-[11px] text-indigo-400 animate-pulse font-medium">Parsing...</span>
                            )}
                        </div>

                        {resumeProfile ? (
                            <div className="space-y-3 text-xs">
                                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-200">
                                            {resumeProfile.current_or_recent_role || role || "Software Professional"}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                                            {resumeProfile.seniority || "Junior"}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                        {resumeProfile.experience_years ? `${resumeProfile.experience_years} Years Experience` : '0-1 Years Experience'} • {resumeProfile.core_domain || 'AI & Tech'}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                                        <span>Indexed Skills ({resumeProfile.skills?.length || 0}):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                                        {(resumeProfile.skills || []).map((skill, idx) => (
                                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-300 text-[10px]">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons: Replace or Remove Resume */}
                                <div className="pt-2 flex items-center gap-2">
                                    <label className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-white/10 cursor-pointer transition-all">
                                        <span>🔄 Replace Resume</span>
                                        <input 
                                            ref={resumeInputRef}
                                            type="file" 
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleResumeChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button 
                                        type="button"
                                        onClick={handleRemoveResume}
                                        className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all flex items-center gap-1"
                                    >
                                        <span>🗑️</span>
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700/80 text-center space-y-2">
                                    <div className="text-2xl">📤</div>
                                    <div className="text-xs font-semibold text-slate-200">Upload Your Resume</div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Upload PDF or DOCX to auto-extract 30+ skills, auto-fill target role, and calculate live compatibility scores.
                                    </p>
                                    <input 
                                        ref={resumeInputRef}
                                        type="file" 
                                        accept=".pdf,.docx,.txt"
                                        onChange={handleResumeChange}
                                        className="block w-full text-xs text-slate-400 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer pt-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                        <span>Skills Saved Locally</span>
                        <span className={resumeProfile ? "text-emerald-400 font-medium" : "text-slate-500"}>
                            {resumeProfile ? "Saved" : "Not Loaded"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar & Search Results Header */}
            {(allMatchedJobs.length > 0 || allUniqueJobs.length > 0 || allRawJobs.length > 0) && (
                <div className="space-y-5">
                    {/* Summary Stat Banner & Export Bar */}
                    <div className="minimal-card rounded-xl p-4 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <button 
                                type="button"
                                onClick={() => setJobScope("raw")}
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${
                                    jobScope === "raw" 
                                        ? "bg-indigo-600/25 border-indigo-500/70 shadow-sm" 
                                        : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80"
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 font-medium">Raw Harvested</div>
                                <div className="text-base sm:text-lg font-bold text-white">{searchStats.total_found || allRawJobs.length}</div>
                            </button>
                            
                            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                            <button 
                                type="button"
                                onClick={() => setJobScope("unique")}
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${
                                    jobScope === "unique" 
                                        ? "bg-indigo-600/25 border-indigo-500/70 shadow-sm" 
                                        : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80"
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 font-medium">Unique Roles</div>
                                <div className="text-base sm:text-lg font-bold text-indigo-400">{searchStats.unique_count || allUniqueJobs.length}</div>
                            </button>
                            
                            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                            <button 
                                type="button"
                                onClick={() => setJobScope("curated")}
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${
                                    jobScope === "curated" 
                                        ? "bg-emerald-600/25 border-emerald-500/70 shadow-sm" 
                                        : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80"
                                }`}
                            >
                                <div className="text-[10px] text-slate-400 font-medium">Curated Matches</div>
                                <div className="text-base sm:text-lg font-bold text-emerald-400">{allMatchedJobs.length}</div>
                            </button>

                            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                            <div className="px-2 py-1">
                                <div className="text-[10px] text-slate-400 font-medium">Filtered View</div>
                                <div className="text-base sm:text-lg font-bold text-cyan-300">{filteredJobs.length}</div>
                            </div>

                            {isHarvestingLive && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold animate-pulse shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>Harvesting Live...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto relative">
                            <button 
                                onClick={() => setRagModalOpen(true)}
                                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>🤖</span>
                                <span>Ask AI</span>
                            </button>

                            {/* CSV Export Dropdown Menu */}
                            <div className="relative flex-1 sm:flex-none">
                                <button 
                                    onClick={() => setCsvMenuOpen(!csvMenuOpen)}
                                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <span>📥</span>
                                    <span>Download CSV</span>
                                    <span className="text-[10px] opacity-75">▼</span>
                                </button>

                                {csvMenuOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-20" 
                                            onClick={() => setCsvMenuOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1 text-xs backdrop-blur-md">
                                            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                Download Datasets
                                            </div>

                                            <button 
                                                onClick={() => exportJobsToCSV("raw")}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">🌐</span>
                                                    <div>
                                                        <div className="font-semibold text-white group-hover:text-indigo-300">Raw Harvested CSV</div>
                                                        <div className="text-[10px] text-slate-400">All live multi-board listings</div>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                                    {allRawJobs.length}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => exportJobsToCSV("unique")}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">🧬</span>
                                                    <div>
                                                        <div className="font-semibold text-indigo-300">Unique Roles CSV</div>
                                                        <div className="text-[10px] text-slate-400">Deduplicated unique postings</div>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                                                    {allUniqueJobs.length}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => exportJobsToCSV("curated")}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">🎯</span>
                                                    <div>
                                                        <div className="font-semibold text-emerald-300">Curated Matches CSV</div>
                                                        <div className="text-[10px] text-slate-400">Top candidate match scores</div>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                                    {allMatchedJobs.length}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => exportJobsToCSV("filtered")}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">🔍</span>
                                                    <div>
                                                        <div className="font-semibold text-cyan-300">Filtered View CSV</div>
                                                        <div className="text-[10px] text-slate-400">Matches active filters</div>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                                                    {filteredJobs.length}
                                                </span>
                                            </button>

                                            <div className="h-px bg-white/[0.08] my-1"></div>

                                            <button 
                                                onClick={handleExportInsightsCSV}
                                                disabled={exportingInsights}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">📊</span>
                                                    <div>
                                                        <div className="font-semibold text-purple-300">
                                                            {exportingInsights ? "Generating Insights..." : "Verified Contacts & Insights CSV"}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">Includes verified emails & AI outreach</div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="minimal-card rounded-xl p-4 border border-white/[0.08] space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
                            {/* Search Keyword */}
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Search Keywords</label>
                                <input 
                                    type="text"
                                    placeholder="Company, title, skill..."
                                    value={filterKeyword}
                                    onChange={(e) => setFilterKeyword(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Smart Location Input with NLP expansion */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[10px] font-semibold text-slate-400 uppercase">
                                        📍 Target Location
                                    </label>
                                    {filterLocationInput && (
                                        <button
                                            type="button"
                                            onClick={() => executeSearch(null, null, filterLocationInput)}
                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                                        >
                                            <span>⚡ Search</span>
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="e.g. Pune, Bangalore, SF, Bay Area, Remote..."
                                        value={filterLocationInput}
                                        onChange={(e) => setFilterLocationInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                executeSearch(null, null, e.target.value);
                                            }
                                        }}
                                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none pr-8"
                                    />
                                    {filterLocationInput && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setFilterLocationInput("");
                                                executeSearch(null, null, "Worldwide");
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Job Pool / Scope Filter */}
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                    📦 Job Pool / Scope
                                </label>
                                <select 
                                    value={jobScope}
                                    onChange={(e) => setJobScope(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-emerald-300"
                                >
                                    <option value="curated">🎯 Curated Matches ({allMatchedJobs.length || 0})</option>
                                    <option value="unique">🧬 Unique Roles ({allUniqueJobs.length || searchStats.unique_count})</option>
                                    <option value="raw">🌐 Raw Harvested ({allRawJobs.length || searchStats.total_found})</option>
                                </select>
                            </div>

                            {/* Sort By Filter */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Sort By</label>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-indigo-300"
                                >
                                    <option value="score">⭐ Highest Match Score</option>
                                    <option value="date">📅 Most Recent</option>
                                </select>
                            </div>

                            {/* Granular Experience Required Filter */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Experience</label>
                                <select 
                                    value={filterExpYears}
                                    onChange={(e) => setFilterExpYears(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="all">🎓 All Levels</option>
                                    <option value="0">🌱 0 Yrs (Intern)</option>
                                    <option value="1">🚀 0–1 Yr (Entry)</option>
                                    <option value="2">⚡ 1–2 Yrs (Junior)</option>
                                    <option value="3-5">💼 3–5 Yrs (Mid)</option>
                                    <option value="5+">👑 5+ Yrs (Senior)</option>
                                    <option value="8+">🏆 8+ Yrs (Lead)</option>
                                </select>
                            </div>
                        </div>

                        {/* Quick Location Preset Suggestion Chips with Live Re-Harvesting */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                            <span className="text-slate-400 text-[10px] font-medium uppercase mr-1">Quick Hubs:</span>
                            {[
                                { label: "📍 All / Worldwide", val: "" },
                                { label: "🇮🇳 India", val: "india" },
                                { label: "📍 Pune", val: "pune" },
                                { label: "📍 Bangalore", val: "bangalore" },
                                { label: "🇺🇸 United States", val: "us" },
                                { label: "🌉 Bay Area", val: "bay area" },
                                { label: "🇬🇧 UK", val: "uk" },
                                { label: "🇩🇪 Germany", val: "germany" },
                                { label: "🏠 Remote", val: "remote" }
                            ].map((hub, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setFilterLocationInput(hub.val);
                                        executeSearch(null, null, hub.val);
                                    }}
                                    className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                                        (filterLocationInput.toLowerCase() === hub.val || (!filterLocationInput && hub.val === ""))
                                            ? "bg-indigo-600 text-white border border-indigo-400 shadow-sm"
                                            : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.06]"
                                    }`}
                                >
                                    {hub.label}
                                </button>
                            ))}
                        </div>

                        {/* Secondary Filter Row: Freshness, Source, Score Slider & Reset */}
                        <div className="pt-3 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center text-xs">
                            {/* Date Posted (Freshness) Filter */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date Posted</label>
                                <select 
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="all">📅 Any Time</option>
                                    <option value="24h">⚡ Past 24 Hours</option>
                                    <option value="3d">🔥 Past 3 Days</option>
                                    <option value="7d">📅 Past Week (7 Days)</option>
                                    <option value="30d">🗓️ Past Month (30 Days)</option>
                                </select>
                            </div>

                            {/* Platform Source */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Platform Source</label>
                                <select 
                                    value={filterSource}
                                    onChange={(e) => setFilterSource(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="all">🌐 All Platforms</option>
                                    <option value="greenhouse">🌿 Greenhouse ATS</option>
                                    <option value="lever">⚙️ Lever ATS</option>
                                    <option value="ashby">⚡ Ashby ATS</option>
                                    <option value="jobicy">🌍 Jobicy</option>
                                    <option value="remoteok">🏖️ RemoteOK</option>
                                    <option value="arbeitnow">🇪🇺 Arbeitnow</option>
                                    <option value="himalayas">🏔️ Himalayas</option>
                                    <option value="linkedin">💼 LinkedIn / Indeed</option>
                                </select>
                            </div>

                            {/* Min Match Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                        Min Match Score
                                    </span>
                                    <span className="text-xs font-bold text-indigo-400">{minScore}%</span>
                                </div>
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

                            {/* Reset Button */}
                            <div className="flex justify-end pt-3 sm:pt-0">
                                {(filterKeyword || filterLocationInput || filterExpYears !== 'all' || filterWorkMode !== 'all' || filterDate !== 'all' || filterSeniority !== 'all' || filterSource !== 'all' || minScore > 0) && (
                                    <button 
                                        onClick={() => {
                                            setFilterKeyword("");
                                            setFilterLocationInput("");
                                            setFilterExpYears("all");
                                            setFilterWorkMode("all");
                                            setMinScore(0);
                                            setFilterSeniority("all");
                                            setFilterDate("all");
                                            setFilterSource("all");
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
                                    >
                                        <span>↺</span> Reset Active Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Re-Harvesting Background Progress Banner */}
                    {searching && (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-semibold animate-pulse shadow-md">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                                <span>Discovering fresh jobs across 9 platforms for <strong>"{role}"</strong>... keeping previous results active on screen until fresh harvest arrives.</span>
                            </div>
                            <div className="text-[11px] font-mono text-indigo-300/80 hidden sm:block">Live Re-Harvesting...</div>
                        </div>
                    )}

                    {/* Job Cards Grid */}
                    {filteredJobs.length === 0 ? (
                        <div className="minimal-card rounded-xl p-10 text-center border border-white/[0.08] space-y-2.5">
                            <div className="text-3xl">🔍</div>
                            <h3 className="text-base font-bold text-white">No jobs match your filter criteria</h3>
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
                                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredJobs.map((job, idx) => (
                                <JobCard 
                                    key={job.id || idx} 
                                    job={job} 
                                    onViewDetails={() => setSelectedJob(job)}
                                    onQueryAI={() => {
                                        setRagQuery(`Tell me about the requirements and salary for ${job.title} at ${job.company}`);
                                        setRagModalOpen(true);
                                    }} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Interactive Job Details Modal */}
            {selectedJob && (
                <JobDetailModal 
                    job={selectedJob} 
                    user={user}
                    token={token}
                    resumeSkills={resumeProfile?.skills || []}
                    onClose={() => setSelectedJob(null)}
                    onUpdateJob={handleUpdateJobContacts}
                    onOpenCookieModal={onOpenCookieModal}
                    showToast={showToast}
                />
            )}

            {/* RAG Assistant Modal */}
            {ragModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="minimal-card rounded-xl max-w-2xl w-full p-5 border border-white/15 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>🤖</span> RAG Job Intelligence Assistant
                            </h3>
                            <button 
                                onClick={() => setRagModalOpen(false)}
                                className="text-slate-400 hover:text-white text-lg leading-none"
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
                                    placeholder="Ask anything (e.g. Which roles require Python and offer remote?)"
                                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none pr-20"
                                />
                                <button 
                                    type="submit"
                                    disabled={ragLoading || !ragQuery.trim()}
                                    className="absolute right-1.5 top-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
                                >
                                    {ragLoading ? "Asking..." : "Ask"}
                                </button>
                            </div>
                        </form>

                        {ragAnswer && (
                            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 text-slate-200 text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
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
// Component: Single Job Card (Minimal Aesthetic)
// ==========================================
function JobCard({ job, onViewDetails, onQueryAI }) {
    const score = Math.round(job.match_score || 0);
    let scoreColor = "bg-slate-800 text-slate-300 border-slate-700";
    if (score >= 80) scoreColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";
    else if (score >= 65) scoreColor = "bg-amber-950/60 text-amber-300 border-amber-500/30";

    // Salary formatting
    let salaryDisplay = "Salary: N/A";
    if (job.salary_range) {
        const minS = job.salary_range.min;
        const maxS = job.salary_range.max;
        const curr = job.salary_range.currency || "$";
        if (minS && maxS) salaryDisplay = `${curr}${minS.toLocaleString()} - ${maxS.toLocaleString()}`;
        else if (minS) salaryDisplay = `> ${curr}${minS.toLocaleString()}`;
    }

    const matchingSkills = job.matching_skills || [];
    const insights = job.company_insights || {};
    const hrCount = (job.hr_contacts || []).length;
    const techCount = (job.tech_contacts || []).length;

    return (
        <div 
            onClick={onViewDetails}
            className="minimal-card rounded-xl p-4 border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3 shadow-md hover:bg-slate-900/70 cursor-pointer"
        >
            <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2.5">
                    <div>
                        <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">
                            {job.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-200">🏢 {job.company || 'Company'}</span>
                            <span>•</span>
                            <span>📍 {job.location || 'Remote'}</span>
                        </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md border font-bold text-xs shrink-0 ${scoreColor}`}>
                        {score}% Match
                    </span>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {/* Exact Required Experience Badge */}
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                        ⏳ Exp: {job.experience_required || job.experience_fit || '🌱 Internship (0 Yrs)'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]">
                        🔗 {job.source || 'Direct'}
                    </span>
                    {salaryDisplay !== 'Salary: N/A' && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium">
                            💰 {salaryDisplay}
                        </span>
                    )}
                    {insights.size_indicator && insights.size_indicator !== 'Unknown' && (
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/[0.06]">
                            👥 {insights.size_indicator}
                        </span>
                    )}
                </div>

                {/* Key Requirements Summary */}
                {job.key_requirements ? (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-white/[0.04]">
                        {job.key_requirements}
                    </p>
                ) : (
                    job.match_reason && (
                        <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">
                            💡 {job.match_reason}
                        </p>
                    )
                )}

                {/* Skills Preview */}
                {matchingSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center pt-0.5">
                        {matchingSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-500/20">
                                ✓ {s}
                            </span>
                        ))}
                        {matchingSkills.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{matchingSkills.length - 3} more</span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Contact & Action Strip */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    {hrCount > 0 || techCount > 0 ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <span>👥</span>
                            <span>{hrCount} HR + {techCount} Tech Leads</span>
                        </span>
                    ) : (
                        <span className="text-slate-500">Click to view team & verified emails</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                        className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all"
                    >
                        View Details →
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Component: Interactive Job Details Modal
// ==========================================
function JobDetailModal({ job, user, token, resumeSkills, onClose, onUpdateJob, onOpenCookieModal, showToast }) {
    const [fetchingContacts, setFetchingContacts] = useState(false);
    const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'contacts' | 'outreach'

    const score = Math.round(job.match_score || 0);
    const insights = job.company_insights || {};
    const hrContacts = job.hr_contacts || [];
    const techContacts = job.tech_contacts || [];
    const allContacts = [...hrContacts, ...techContacts];

    // Fetch / Refresh HR & Tech Contacts
    const handleFetchContacts = async () => {
        setFetchingContacts(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${job.id}/fetch-hr-contacts`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({
                    candidate_name: user?.email ? user.email.split("@")[0] : "Candidate",
                    candidate_skills: resumeSkills || job.matching_skills || [],
                    include_tech: true
                })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                const updated = {
                    ...job,
                    hr_contacts: data.hr_contacts || [],
                    tech_contacts: data.tech_contacts || []
                };
                onUpdateJob(updated);
                showToast(`Enriched ${data.hr_contacts?.length || 0} HR + ${data.tech_contacts?.length || 0} Tech contacts!`);

                if (data.cookie_expired) {
                    showToast("⚠️ LinkedIn cookie expired. Fallback dorking was used. Click top badge to refresh.", "error");
                }
            } else {
                showToast(data.message || "Failed to discover contacts.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setFetchingContacts(false);
        }
    };

    // Auto-fetch contacts if not already loaded
    useEffect(() => {
        if (allContacts.length === 0 && !fetchingContacts) {
            handleFetchContacts();
        }
    }, [job.id]);

    const copyToClipboard = (text, label = "Copied!") => {
        navigator.clipboard.writeText(text);
        showToast(label);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="minimal-card rounded-2xl max-w-3xl w-full my-8 p-5 sm:p-6 border border-white/15 shadow-2xl space-y-5 text-xs max-h-[90vh] flex flex-col justify-between">
                {/* Header */}
                <div className="space-y-3 pb-3 border-b border-white/[0.08]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                                {job.title}
                            </h3>
                            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-indigo-300">🏢 {job.company}</span>
                                <span>•</span>
                                <span>📍 {job.location || 'Remote'}</span>
                                <span>•</span>
                                <span className="text-slate-400">📅 {job.posted_date || 'Recent'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold text-xs shrink-0">
                                {score}% Fit
                            </span>
                            <button 
                                onClick={onClose}
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 pt-1">
                        <button 
                            onClick={() => setActiveTab("overview")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'overview' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            📋 Overview & Insights
                        </button>
                        <button 
                            onClick={() => setActiveTab("contacts")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === 'contacts' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <span>👥 Team & Emails</span>
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px]">
                                {allContacts.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab("outreach")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'outreach' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            ✉️ AI Outreach Drafter
                        </button>
                    </div>
                </div>

                {/* Modal Tab Body */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* TAB 1: OVERVIEW & INSIGHTS */}
                    {activeTab === "overview" && (
                        <div className="space-y-4">
                            {/* Experience & Seniority Requirement */}
                            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-2">
                                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>⏳ Experience & Seniority Requirements</span>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm">
                                        {job.experience_required || job.experience_fit || '🌱 Internship (0 Yrs)'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                    <div><strong className="text-slate-400">Experience Needed:</strong> <span className="text-white font-semibold">{job.experience_required || '0–1 Yrs (Entry Level)'}</span></div>
                                    <div><strong className="text-slate-400">AI Seniority Fit:</strong> <span className="text-indigo-300 font-semibold">{job.experience_fit || 'Good Fit'}</span></div>
                                </div>
                            </div>

                            {/* Key Requirements Summary */}
                            {job.key_requirements && (
                                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 space-y-1">
                                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                                        ⚡ What This Job Actually Requires (Plain English)
                                    </div>
                                    <p className="text-slate-200 text-xs leading-relaxed">
                                        {job.key_requirements}
                                    </p>
                                </div>
                            )}

                            {/* Company Insights Panel */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2">
                                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                        🏢 Company Profile
                                    </div>
                                    <div className="space-y-1 text-slate-400">
                                        <div><strong className="text-slate-200">Size:</strong> {insights.size_indicator || 'Unknown'}</div>
                                        <div><strong className="text-slate-200">Industry:</strong> {insights.industry || 'Tech'}</div>
                                        <div><strong className="text-slate-200">Work Mode:</strong> {job.location?.toLowerCase().includes('remote') ? 'Remote' : 'Onsite / Hybrid'}</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2">
                                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                        🌱 Culture Signals
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {(insights.culture_signals || ["collaborative", "fast-paced"]).map((c, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Red Flags Alert if Any */}
                            {insights.red_flags && insights.red_flags.length > 0 && (
                                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 space-y-1">
                                    <div className="font-bold flex items-center gap-1.5">
                                        <span>⚠️</span>
                                        <span>Noted Red Flags from Job Description</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                        {insights.red_flags.map((rf, i) => (
                                            <li key={i}>{rf}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills Taxonomy Breakdown */}
                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2.5">
                                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                    🛠️ Skill Alignment Matrix
                                </div>
                                <div className="space-y-2">
                                    {job.matching_skills && job.matching_skills.length > 0 && (
                                        <div>
                                            <span className="text-[11px] text-emerald-400 font-semibold block mb-1">Matched Skills:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {job.matching_skills.map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px]">
                                                        ✓ {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {job.missing_skills && job.missing_skills.length > 0 && (
                                        <div>
                                            <span className="text-[11px] text-amber-400 font-semibold block mb-1">Missing / Skill Gaps:</span>
                                            <div className="flex flex-wrap gap-1">
                                                {job.missing_skills.map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px]">
                                                        ! {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Job Description Raw */}
                            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-1.5">
                                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                    📄 Full Job Description
                                </div>
                                <div className="text-slate-300 text-xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-white/[0.04]">
                                    {cleanHtmlJobDescription(job.description)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TEAM & CONTACTS */}
                    {activeTab === "contacts" && (
                        <div className="space-y-4">
                            {allContacts.length === 0 ? (
                                fetchingContacts ? (
                                    <div className="p-8 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-center space-y-3">
                                        <div className="inline-block w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                        <div className="text-white font-bold text-xs">Discovering Recruiter & Tech Contacts in Parallel...</div>
                                        <p className="text-slate-400 text-xs max-w-md mx-auto">
                                            Auto-scraping corporate team directory, verifying SMTP email deliverability, and generating tailored AI outreach drafts for <strong className="text-slate-200">{job.company}</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-3">
                                        <div className="text-2xl">👥</div>
                                        <div className="text-white font-bold text-xs">No recruiter or tech contacts loaded yet</div>
                                        <p className="text-slate-400 text-xs">
                                            Trigger live Scout multi-factor discovery to find HR managers, tech leads, verified emails, phone numbers, and LinkedIn profile URLs.
                                        </p>
                                        <button 
                                            onClick={handleFetchContacts}
                                            disabled={fetchingContacts}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-50"
                                        >
                                            {fetchingContacts ? "Discovering Contacts..." : "⚡ Discover HR & Tech Contacts Now"}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-300">
                                            Found {hrContacts.length} HR Contacts + {techContacts.length} Tech Leads
                                        </span>
                                        <button 
                                            onClick={handleFetchContacts}
                                            disabled={fetchingContacts}
                                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] disabled:opacity-50"
                                        >
                                            {fetchingContacts ? "Refreshing..." : "↻ Refresh Contacts"}
                                        </button>
                                    </div>

                                    {/* HR Contacts List */}
                                    {hrContacts.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                                🎯 Technical Recruiters & Talent Acquisition
                                            </div>
                                            {hrContacts.map((c, i) => (
                                                <ContactCard key={i} contact={c} onCopy={copyToClipboard} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Tech Leadership List */}
                                    {techContacts.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                                                💻 Engineering Leadership & Tech Leads
                                            </div>
                                            {techContacts.map((c, i) => (
                                                <ContactCard key={i} contact={c} onCopy={copyToClipboard} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: AI OUTREACH DRAFTER */}
                    {activeTab === "outreach" && (
                        <div className="space-y-4">
                            {allContacts.length === 0 ? (
                                fetchingContacts ? (
                                    <div className="p-8 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-center space-y-3">
                                        <div className="inline-block w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                        <div className="text-white font-bold text-xs">Generating Tailored Outreach Drafts...</div>
                                        <p className="text-slate-400 text-xs max-w-md mx-auto">
                                            Synthesizing recruiter profiles, corporate tone, and your matching skills for <strong className="text-slate-200">{job.company}</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-2">
                                        <div className="text-slate-400 text-xs">
                                            Discover team contacts first to generate tailored cold outreach drafts!
                                        </div>
                                        <button 
                                            onClick={handleFetchContacts}
                                            disabled={fetchingContacts}
                                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                                        >
                                            {fetchingContacts ? "Loading..." : "⚡ Find Contacts & Generate Drafts"}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-3">
                                    {allContacts.map((c, i) => {
                                        const draft = c.outreach_draft || {};
                                        return (
                                            <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08] space-y-2.5">
                                                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                                                    <div>
                                                        <span className="font-bold text-white text-xs">{c.full_name}</span>
                                                        <span className="text-slate-400 text-[11px] ml-2">({c.headline})</span>
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                                                        Tailored for {job.company}
                                                    </span>
                                                </div>

                                                {/* Email Draft */}
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cold Email Subject & Body:</span>
                                                        <button 
                                                            onClick={() => copyToClipboard(`${draft.email_subject || ''}\n\n${draft.email_body || ''}`, "Copied Cold Email!")}
                                                            className="text-indigo-400 hover:underline text-[11px]"
                                                        >
                                                            📋 Copy Email
                                                        </button>
                                                    </div>
                                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-white/[0.04] space-y-1 text-slate-300">
                                                        <div className="font-semibold text-slate-200">Subject: {draft.email_subject || `Application for ${job.title}`}</div>
                                                        <div className="whitespace-pre-wrap leading-relaxed">{draft.email_body || "Draft will appear here."}</div>
                                                    </div>
                                                </div>

                                                {/* LinkedIn Note */}
                                                {draft.linkedin_note && (
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn Connection Note (&lt;280 chars):</span>
                                                            <button 
                                                                onClick={() => copyToClipboard(draft.linkedin_note, "Copied LinkedIn Note!")}
                                                                className="text-indigo-400 hover:underline text-[11px]"
                                                            >
                                                                📋 Copy Note
                                                            </button>
                                                        </div>
                                                        <div className="bg-slate-950 p-2 rounded-lg border border-white/[0.04] text-slate-300 italic">
                                                            "{draft.linkedin_note}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
                    <button 
                        onClick={handleFetchContacts}
                        disabled={fetchingContacts}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                        <span>👥</span>
                        <span>{fetchingContacts ? "Enriching Team..." : "Enrich Team Contacts"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onClose}
                            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs"
                        >
                            Close
                        </button>
                        {job.url && (
                            <a 
                                href={job.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
                            >
                                Apply on Career Page ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Sub-Component: Contact Card
// ==========================================
function ContactCard({ contact, onCopy }) {
    const conf = contact.confidence_score || 65;
    let confBadge = "bg-slate-800 text-slate-300";
    if (conf >= 85) confBadge = "bg-emerald-950 text-emerald-300 border border-emerald-500/30";
    else if (conf >= 60) confBadge = "bg-amber-950 text-amber-300 border border-amber-500/30";

    return (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{contact.full_name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${confBadge}`}>
                        {conf}% verified
                    </span>
                </div>
                <div className="text-[11px] text-slate-400">{contact.headline}</div>
                
                {/* Contact details row */}
                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-300">
                    {contact.email && (
                        <div className="flex items-center gap-1.5">
                            <span>✉️</span>
                            <span className="font-mono text-[11px] text-indigo-300">{contact.email}</span>
                            <button 
                                onClick={() => onCopy(contact.email, "Copied Email!")}
                                className="text-slate-500 hover:text-white text-[11px]"
                                title="Copy Email"
                            >
                                📋
                            </button>
                        </div>
                    )}

                    {contact.phone && (
                        <div className="flex items-center gap-1.5">
                            <span>📞</span>
                            <span className="text-[11px]">{contact.phone}</span>
                            {contact.whatsapp_url && (
                                <a 
                                    href={contact.whatsapp_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline text-[11px]"
                                    title="Open WhatsApp Chat"
                                >
                                    💬 WhatsApp
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Link Button */}
            {contact.profile_url && (
                <a 
                    href={contact.profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium shrink-0 flex items-center justify-center gap-1"
                >
                    <span>🔗</span>
                    <span>LinkedIn Profile</span>
                </a>
            )}
        </div>
    );
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView({ token, user, cookieStatusInfo, onOpenCookieModal, showToast }) {
    const [email, setEmail] = useState(user.email || "");
    const [role, setRole] = useState("AI ML Intern");
    const [location, setLocation] = useState("Pune");
    const [workMode, setWorkMode] = useState("any");
    const [experienceLevel, setExperienceLevel] = useState("intern");
    const [maxAgeDays, setMaxAgeDays] = useState(3);
    const [preferredTime, setPreferredTime] = useState("09:00");

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
                showToast(`Resume attached! Extracted ${data.profile.skills?.length || 0} skills.`);
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
                showToast(`Sent ${data.jobs_sent || 0} Jobs + CSV to ${email}!`);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span>⏰</span> Automated Daily Job Digest
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Runs scheduled multi-board scrapers with deduplication and delivers matching roles with curated CSV directly to your inbox.
                        </p>
                    </div>

                    {/* Cookie Health Pill inside Alerts */}
                    <button 
                        onClick={onOpenCookieModal}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all shrink-0"
                    >
                        {cookieStatusInfo?.cookie_status === 'active' ? '🟢 Cookie Active' : (cookieStatusInfo?.cookie_status === 'expired' ? '🔴 Cookie Expired' : '⚪ Add Cookie')}
                    </button>
                </div>

                <form onSubmit={handleSaveAlert} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Destination Email Address <span className="text-indigo-400">*</span>
                        </label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. xyz@gmail.com"
                            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Target Role / Title <span className="text-indigo-400">*</span>
                            </label>
                            <input 
                                type="text" 
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Preferred Location
                            </label>
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Work Mode</label>
                            <select 
                                value={workMode}
                                onChange={(e) => setWorkMode(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="any">🌐 Any</option>
                                <option value="remote">🏠 Remote</option>
                                <option value="onsite">🏢 Onsite</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Experience Level</label>
                            <select 
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="intern">🌱 Internship / Fresher (0 Yrs)</option>
                                <option value="entry">🚀 0–1 Yr (Entry Level)</option>
                                <option value="junior">⚡ 1–2 Yrs (Junior)</option>
                                <option value="mid">💼 3–5 Yrs (Mid-Level)</option>
                                <option value="senior">👑 5+ Yrs (Senior)</option>
                                <option value="lead">🏆 8+ Yrs (Lead / Staff)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Posted Window</label>
                            <select 
                                value={maxAgeDays}
                                onChange={(e) => setMaxAgeDays(Number(e.target.value))}
                                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            >
                                <option value={1}>⏱️ 24h</option>
                                <option value={3}>📅 3 Days</option>
                                <option value={7}>🗓️ 7 Days</option>
                                <option value={0}>🌐 All Dates</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Time (24h)</label>
                            <input 
                                type="time" 
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving Schedule..." : "💾 Save Daily Automation"}
                        </button>

                        <button 
                            type="button" 
                            onClick={handleSendTestEmail}
                            disabled={testing}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                        >
                            {testing ? "Sending..." : "⚡ Send Live Test Digest Now"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Active Automations List */}
            <div className="minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                    <span>📋 Active Automations</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {activeAlerts.length} Active
                    </span>
                </h3>

                {loadingAlerts ? (
                    <div className="text-center py-6 text-xs text-slate-500">Loading schedules...</div>
                ) : activeAlerts.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                        No active schedules.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {activeAlerts.map((alert) => (
                            <div key={alert.id} className="p-3 rounded-lg bg-slate-900 border border-white/[0.04] space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-white text-xs">{alert.role}</div>
                                        <div className="text-[11px] text-slate-400">
                                            📍 {alert.location || 'Remote'} • ⏰ {alert.preferred_time}
                                        </div>
                                        <div className="text-[10px] text-indigo-400">✉️ {alert.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteAlert(alert.id)}
                                        className="text-slate-500 hover:text-rose-400 text-xs p-1"
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
                showToast(`User '${newEmail}' created!`);
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
        <div className="space-y-6">
            <div className="minimal-card rounded-xl p-5 border border-white/[0.08]">
                <h2 className="text-base font-bold text-white mb-3">🛡️ Admin User Control</h2>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input 
                        type="email"
                        required
                        placeholder="User email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                    <input 
                        type="text"
                        required
                        placeholder="Initial password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                    <select 
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                        <option value="user">Standard User</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <button 
                        type="submit"
                        disabled={creating}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                        {creating ? "Creating..." : "➕ Create Account"}
                    </button>
                </form>
            </div>

            <div className="minimal-card rounded-xl overflow-hidden border border-white/[0.08]">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="font-bold text-white text-xs">Registered Accounts ({users.length})</h3>
                    <button onClick={fetchUsers} className="text-xs text-indigo-400 hover:underline">Refresh</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-slate-400 border-b border-white/[0.06]">
                            <tr>
                                <th className="py-2.5 px-4">Email</th>
                                <th className="py-2.5 px-4">Role</th>
                                <th className="py-2.5 px-4">Status</th>
                                <th className="py-2.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.01]">
                                    <td className="py-2.5 px-4 text-slate-200">{u.email}</td>
                                    <td className="py-2.5 px-4 text-slate-400">{u.role}</td>
                                    <td className="py-2.5 px-4">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${u.is_active ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                                            {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-right space-x-2">
                                        {u.id !== user.id && (
                                            <>
                                                <button onClick={() => handleToggleStatus(u.id)} className="text-slate-400 hover:text-white text-[11px]">
                                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-rose-400 hover:underline text-[11px]">
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
