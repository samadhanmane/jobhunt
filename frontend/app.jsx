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
    if (!dateStr || days === 0 || days === 'all') return true;
    const str = String(dateStr).toLowerCase().trim();
    if (str.includes("today") || str.includes("just") || str.includes("hour") || str.includes("minute")) return true;
    if (days >= 1 && str.includes("yesterday")) return true;
    if (str.includes("day ago") || str.includes("days ago")) {
        const match = str.match(/(\d+)\s*day/);
        if (match) {
            return parseInt(match[1]) <= days;
        }
    }
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
        return (diffMs / (1000 * 60 * 60 * 24)) <= (days + 0.5);
    } catch {
        return true;
    }
}

function getJobExperienceBadge(job) {
    if (!job) return "🌱 Internship (0 Yrs)";
    const title = (job.title || "").toLowerCase();
    const desc = (job.description || "").toLowerCase();
    const fit = (job.experience_fit || "").toLowerCase();
    const req = (job.experience_required || "").toLowerCase();
    const minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;

    // 1. True Intern
    if (title.includes('intern') || title.includes('internship') || title.includes('trainee') || title.includes('apprentice') || title.includes('co-op') || title.includes('student') || fit.includes('intern') || req.includes('intern')) {
        return "🌱 Internship (0 Yrs)";
    }

    // 2. Senior / Lead / Principal
    if (title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || minYears >= 8 || req.includes('8+')) {
        return "🏆 Lead / Principal (8+ Yrs)";
    }
    if (title.includes('senior') || title.includes('sr.') || title.includes('sr ') || title.includes('lead') || minYears >= 5 || req.includes('5+') || fit.includes('senior')) {
        return "👑 Senior (5+ Yrs)";
    }

    // 3. Entry / Fresher
    if (title.includes('entry level') || title.includes('fresher') || title.includes('new grad') || title.includes('graduate') || req.includes('0-1') || minYears === 0 || minYears === 1) {
        return "🚀 Entry Level (0–1 Yr)";
    }

    // 4. Junior
    if (title.includes('junior') || title.includes('jr.') || title.includes('associate') || req.includes('1-2') || minYears === 2 || fit.includes('junior')) {
        return "⚡ Junior (1–2 Yrs)";
    }

    // 5. Mid Level
    if (minYears >= 3 && minYears <= 5) {
        return `💼 Mid-Level (${minYears} Yrs)`;
    }

    return job.experience_required || "💼 Mid-Level (2–4 Yrs)";
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
// Reusable CSV Export Utility
// ==========================================
function generateJobsCSV(jobsList = [], scopeLabel = "Curated Matches", filenamePrefix = "jobhunt_jobs") {
    if (!jobsList || jobsList.length === 0) {
        return false;
    }

    const headers = [
        "Job ID",
        "Scope",
        "Applied Status",
        "Applied Date",
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
        "HR Contacts Found",
        "HR Emails",
        "Tech Contacts Found",
        "Tech Emails",
        "Cold Outreach Email Draft",
        "LinkedIn Connection Note Draft",
        "Company Insights JSON",
        "Full Job Description"
    ];

    const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const str = String(field);
        return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = jobsList.map(j => {
        const loc = (j.location || "").toLowerCase();
        let workMode = "Onsite";
        if (loc.includes("remote") || loc.includes("wfh") || loc.includes("work from home") || j.source === "himalayas" || j.source === "jobicy" || j.source === "remoteok") {
            workMode = "Remote";
        } else if (loc.includes("hybrid") || (j.description || "").toLowerCase().includes("hybrid")) {
            workMode = "Hybrid";
        }

        const matchingSkillsStr = (j.matching_skills || []).join(", ");
        const missingSkillsStr = (j.missing_skills || []).join(", ");

        const hrContacts = (j.hr_contacts || []).map(c => `${c.full_name} (${c.headline || 'HR/Talent'})`).join(" | ");
        const hrEmails = (j.hr_contacts || []).map(c => c.email).filter(Boolean).join(" | ");
        const techContacts = (j.tech_contacts || []).map(c => `${c.full_name} (${c.headline || 'Engineering'})`).join(" | ");
        const techEmails = (j.tech_contacts || []).map(c => c.email).filter(Boolean).join(" | ");

        let coldEmail = "";
        let linkedinNote = "";
        const sampleContact = (j.hr_contacts && j.hr_contacts[0]) || (j.tech_contacts && j.tech_contacts[0]);
        if (sampleContact && sampleContact.outreach_draft) {
            coldEmail = `Subject: ${sampleContact.outreach_draft.email_subject || ''}\n\n${sampleContact.outreach_draft.email_body || ''}`;
            linkedinNote = sampleContact.outreach_draft.inmail_message || "";
        }

        const insights = j.company_insights ? JSON.stringify(j.company_insights) : "";
        const isAppliedStr = j.applied_at ? "Applied" : "Not Applied";
        const appliedDateStr = j.applied_at ? new Date(j.applied_at).toLocaleString() : "";

        return [
            escapeCSV(j.id || ""),
            escapeCSV(scopeLabel),
            escapeCSV(isAppliedStr),
            escapeCSV(appliedDateStr),
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
    return true;
}

// ==========================================
// Component: Dedicated Applied Jobs Tracker Modal
// ==========================================
function AppliedJobsTrackerModal({
    appliedJobs = [],
    onToggleApplied,
    onViewDetails,
    onClose,
    onExportCSV,
    onViewInDashboard
}) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return appliedJobs;
        const q = searchQuery.toLowerCase().trim();
        return appliedJobs.filter(j =>
            (j.title || "").toLowerCase().includes(q) ||
            (j.company || "").toLowerCase().includes(q) ||
            (j.location || "").toLowerCase().includes(q)
        );
    }, [appliedJobs, searchQuery]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="minimal-card rounded-2xl max-w-4xl w-full my-6 p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                <span>📋</span>
                                <span>Applied Jobs Tracker</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {appliedJobs.length} Applications Saved
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Your tracked job submissions synced automatically across laptop and mobile devices.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search applied roles, companies, or locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {appliedJobs.length > 0 && (
                            <button
                                onClick={onExportCSV}
                                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                            >
                                <span>📥</span>
                                <span>Export CSV</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onViewInDashboard?.();
                                onClose();
                            }}
                            className="px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                            <span>🎯</span>
                            <span>Filter in Dashboard</span>
                        </button>
                    </div>
                </div>

                {/* Applied Jobs List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[58vh]">
                    {appliedJobs.length === 0 ? (
                        <div className="p-10 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center space-y-2.5">
                            <div className="text-3xl">🌱</div>
                            <div className="font-bold text-white text-sm">No applications tracked yet</div>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Click the <strong className="text-emerald-300">✓ Apply</strong> checkmark on any job card or inside job details to log your application. It will sync across all your devices in real-time!
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                            No applications matched your search query "{searchQuery}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filtered.map((job, idx) => (
                                <div
                                    key={job.id || idx}
                                    className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/50 transition-all space-y-2.5 flex flex-col justify-between shadow-md"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">
                                                {job.title}
                                            </h4>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                                                ✓ Applied
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-slate-200">🏢 {job.company || 'Company'}</span>
                                            <span>•</span>
                                            <span>📍 {job.location || 'Remote'}</span>
                                        </p>

                                        <div className="text-[10px] text-emerald-400 font-medium">
                                            🗓️ Applied: {job.applied_at ? new Date(job.applied_at).toLocaleString() : 'Recently'}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {job.url && (
                                                <a
                                                    href={job.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-1 px-2 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-[11px] transition-all flex items-center gap-1"
                                                >
                                                    <span>Link</span>
                                                    <span>↗</span>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onViewDetails?.(job);
                                                    onClose();
                                                }}
                                                className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] transition-all"
                                            >
                                                Details 🔍
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onToggleApplied(job)}
                                            className="text-rose-400 hover:text-rose-300 text-[11px] hover:underline"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
    const [activeSnapshot, setActiveSnapshot] = useState(null);

    // Applied Jobs State (Cross-Device Synchronized)
    const [appliedJobs, setAppliedJobs] = useState(() => {
        try {
            const saved = localStorage.getItem("jobhunt_applied_jobs");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [appliedTrackerOpen, setAppliedTrackerOpen] = useState(false);

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

    const handleInspectSnapshot = (snapshotData) => {
        setActiveSnapshot(snapshotData);
        setActiveTab('search');
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
            .catch(() => { });
    };

    // Sync Applied Jobs and Profile from Database on Mount / Login
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

            // Bidirectional Cross-Device Sync
            fetch(`${API_BASE_URL}/api/v1/auth/sync-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.applied_jobs && Array.isArray(data.applied_jobs)) {
                        setAppliedJobs(prev => {
                            const mergedMap = new Map();
                            for (const j of prev) {
                                const k = ((j.url || j.job_url || `${j.title}-${j.company}-${j.location}`) || "").toLowerCase().trim();
                                if (k) mergedMap.set(k, j);
                            }
                            for (const j of data.applied_jobs) {
                                const k = ((j.url || j.job_url || `${j.title}-${j.company}-${j.location}`) || "").toLowerCase().trim();
                                if (k) mergedMap.set(k, j);
                            }
                            const merged = Array.from(mergedMap.values());
                            try {
                                localStorage.setItem("jobhunt_applied_jobs", JSON.stringify(merged));
                            } catch (e) {}
                            return merged;
                        });
                    }
                })
                .catch(() => {});
        }
    }, [token]);

    const toggleJobApplied = (job) => {
        if (!job) return;
        const key = ((job.url || job.job_url || `${job.title}-${job.company}-${job.location}`) || "").toLowerCase().trim();
        if (!key) return;

        setAppliedJobs(prev => {
            const exists = prev.some(item => ((item.url || item.job_url || `${item.title}-${item.company}-${item.location}`) || "").toLowerCase().trim() === key);
            let updated;
            if (exists) {
                updated = prev.filter(item => ((item.url || item.job_url || `${item.title}-${item.company}-${item.location}`) || "").toLowerCase().trim() !== key);
                showToast(`Removed "${job.title}" from Applied tracker.`);
            } else {
                const appliedEntry = {
                    ...job,
                    applied_at: new Date().toISOString()
                };
                updated = [appliedEntry, ...prev];
                showToast(`✓ Marked "${job.title}" as Applied!`);
            }
            try {
                localStorage.setItem("jobhunt_applied_jobs", JSON.stringify(updated.slice(0, 500)));
            } catch (e) {}

            // Persist to Server for Multi-Device Sync
            if (token) {
                fetch(`${API_BASE_URL}/api/v1/auth/sync-data`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ applied_jobs: updated.slice(0, 500) })
                }).catch(() => {});
            }

            return updated;
        });
    };

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
        showToast("Signed out successfully.");
        setActiveTab('search');
    };

    if (!token || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <LoginScreen onLoginSuccess={handleLoginSuccess} showToast={showToast} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Minimal Nav Header */}
            <Navbar
                user={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                cookieStatusInfo={cookieStatusInfo}
                appliedJobsCount={appliedJobs.length}
                onOpenAppliedModal={() => setAppliedTrackerOpen(true)}
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
                    <div className={`px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 border text-xs font-medium ${toast.type === 'error'
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
                        appliedJobs={appliedJobs}
                        onToggleApplied={toggleJobApplied}
                        onOpenAppliedModal={() => setAppliedTrackerOpen(true)}
                        onOpenCookieModal={() => setCookieModalOpen(true)}
                        showToast={showToast}
                        activeSnapshot={activeSnapshot}
                        onExitSnapshot={() => setActiveSnapshot(null)}
                    />
                )}
                {activeTab === 'alerts' && (
                    <EmailAlertsView
                        token={token}
                        user={currentUser}
                        cookieStatusInfo={cookieStatusInfo}
                        onOpenCookieModal={() => setCookieModalOpen(true)}
                        showToast={showToast}
                        onInspectSnapshot={handleInspectSnapshot}
                    />
                )}
                {activeTab === 'admin' && currentUser.role === 'admin' && (
                    <AdminPortal token={token} user={currentUser} showToast={showToast} />
                )}
            </main>

            {/* Applied Jobs Tracker Modal */}
            {appliedTrackerOpen && (
                <AppliedJobsTrackerModal
                    appliedJobs={appliedJobs}
                    onToggleApplied={toggleJobApplied}
                    onViewDetails={(job) => {
                        setActiveTab('search');
                    }}
                    onClose={() => setAppliedTrackerOpen(false)}
                    onExportCSV={() => generateJobsCSV(appliedJobs, "Applied Tracker", "jobhunt_applied_jobs")}
                    onViewInDashboard={() => {
                        setActiveTab('search');
                    }}
                />
            )}

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
function Navbar({ user, activeTab, setActiveTab, cookieStatusInfo, appliedJobsCount = 0, onOpenAppliedModal, onOpenCookieModal, onLogout }) {
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
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
                {/* Brand Logo */}
                <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('search')}>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400">
                        ⚡
                    </div>
                    <div>
                        <div className="font-bold text-sm sm:text-base text-slate-100 tracking-tight leading-none">
                            JobAgent <span className="text-indigo-400 font-semibold">AI</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">Multi-Source ATS & Talent Discovery</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/[0.08]">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'search'
                                ? 'bg-indigo-600/90 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                            }`}
                    >
                        <span>🔍</span>
                        <span className="hidden xs:inline">Search</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'alerts'
                                ? 'bg-indigo-600/90 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                            }`}
                    >
                        <span>⏰</span>
                        <span className="hidden xs:inline">Alerts</span>
                    </button>

                    {user.role === 'admin' && (
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'admin'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                }`}
                        >
                            <span>🛡️</span>
                            <span className="hidden sm:inline">Admin</span>
                        </button>
                    )}
                </nav>

                {/* User Menu, Applied Corner Button, LinkedIn Cookie & Logout */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {/* Applied Jobs Corner Pill */}
                    <button
                        onClick={onOpenAppliedModal}
                        title="Open your tracked Applied Jobs"
                        className="px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900 hover:border-emerald-500 shadow-sm"
                    >
                        <span className="text-emerald-400 font-extrabold text-xs">✓</span>
                        <span className="hidden sm:inline font-bold">Applied</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold">
                            {appliedJobsCount}
                        </span>
                    </button>

                    {/* LinkedIn Cookie Status Pill */}
                    <button
                        onClick={onOpenCookieModal}
                        title="Configure your LinkedIn session cookie for authenticated recruiter scraping"
                        className={`px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${cookieBadge.color}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${cookieBadge.dot}`}></span>
                        <span className="hidden md:inline">{cookieBadge.label}</span>
                        <span className="md:hidden">Cookie</span>
                    </button>

                    <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs">
                        <span className="text-slate-300 font-medium">{user.email}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    <button
                        onClick={onLogout}
                        title="Sign Out"
                        className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-medium transition-all"
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
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${currentStatus === 'active'
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
                        <PasswordInput
                            required
                            placeholder="AQEDATxxxxxx..."
                            value={cookieInput}
                            onChange={(e) => setCookieInput(e.target.value)}
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
// Component: Password Input with Eye Toggle
// ==========================================
function PasswordInput({ value, onChange, placeholder, required, className, autoFocus }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative w-full">
            <input
                type={showPassword ? "text" : "password"}
                required={required}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "••••••••"}
                autoFocus={autoFocus}
                className={`w-full pr-10 ${className || "px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"}`}
            />
            <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md focus:outline-none"
            >
                {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

// ==========================================
// Component: Forgot / Reset Password Modal (Email OTP)
// ==========================================
function ForgotPasswordModal({ onClose, showToast }) {
    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Set Password, 3 = Success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                showToast("Verification OTP sent to your email!");
            } else {
                setError(data.detail || "Failed to send OTP code.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please verify.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    otp: otp.trim(),
                    new_password: newPassword.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(3);
                setSuccessMessage(data.message || "Password successfully reset!");
                showToast("Password successfully reset! You can now log in.");
            } else {
                setError(data.detail || "Password reset failed. Please check the OTP.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="minimal-card rounded-2xl max-w-md w-full p-6 border border-white/15 shadow-2xl space-y-4 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🔐</span>
                        <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {error}
                    </div>
                )}

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-3.5">
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Enter the email address associated with your account. We will send you a <strong>6-digit OTP verification code</strong> valid for 15 minutes.
                        </p>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Account Email
                            </label>
                            <input
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {loading ? "Sending OTP..." : "Send Verification OTP →"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Enter OTP & New Password */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-3.5">
                        <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs">
                            ✉️ We sent a 6-digit OTP code to <strong>{email}</strong>. Please check your inbox and spam folder.
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                6-Digit OTP Code
                            </label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                autoFocus
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-[6px] text-base focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                New Password
                            </label>
                            <PasswordInput
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                Confirm New Password
                            </label>
                            <PasswordInput
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6 || !newPassword || !confirmPassword}
                                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                            >
                                {loading ? "Resetting Password..." : "✓ Reset Password & Save"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Success Banner */}
                {step === 3 && (
                    <div className="text-center py-4 space-y-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-2xl border border-emerald-500/30">
                            ✓
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Password Reset Successful!</h4>
                            <p className="text-slate-400 text-xs mt-1">
                                {successMessage || "Your password has been securely updated. You can now log in with your new credentials."}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                        >
                            Proceed to Sign In →
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
function LoginScreen({ onLoginSuccess, showToast }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [forgotModalOpen, setForgotModalOpen] = useState(false);

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
                body: JSON.stringify({ email: email.trim(), password })
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-white/10 text-xl text-indigo-400 mb-3 shadow-lg">
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
                        <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
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
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setForgotModalOpen(true)}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <PasswordInput
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5"
                    >
                        {loading ? "Authenticating..." : "Sign In →"}
                    </button>
                </form>
            </div>

            {/* Forgot Password Modal */}
            {forgotModalOpen && (
                <ForgotPasswordModal
                    onClose={() => setForgotModalOpen(false)}
                    showToast={showToast || ((msg) => alert(msg))}
                />
            )}
        </div>
    );
}

function JobSearchDashboard({
    token,
    user,
    cookieStatusInfo,
    appliedJobs = [],
    onToggleApplied,
    onOpenAppliedModal,
    onOpenCookieModal,
    showToast,
    activeSnapshot,
    onExitSnapshot
}) {
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

    // Mutable refs to prevent asynchronous batching loss in merge operations
    const allMatchedJobsRef = useRef([]);
    const allUniqueJobsRef = useRef([]);
    const allRawJobsRef = useRef([]);

    useEffect(() => {
        allMatchedJobsRef.current = allMatchedJobs;
    }, [allMatchedJobs]);

    useEffect(() => {
        allUniqueJobsRef.current = allUniqueJobs;
    }, [allUniqueJobs]);

    useEffect(() => {
        allRawJobsRef.current = allRawJobs;
    }, [allRawJobs]);

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
    const [jobScope, setJobScope] = useState("curated"); // 'curated' | 'unique' | 'raw' | 'applied'
    const [sortBy, setSortBy] = useState("score"); // 'score' | 'date'

    const getJobKey = (job) => {
        if (!job) return "";
        return ((job.url || job.job_url || `${job.title}-${job.company}-${job.location}`) || "").toLowerCase().trim();
    };

    const appliedJobKeys = useMemo(() => {
        const set = new Set();
        for (const j of appliedJobs) {
            const k = getJobKey(j);
            if (k) set.add(k);
        }
        return set;
    }, [appliedJobs]);

    // Listen for incoming historical automation snapshots to inspect
    useEffect(() => {
        if (activeSnapshot) {
            setAllMatchedJobs(activeSnapshot.curated_jobs || []);
            setAllUniqueJobs(activeSnapshot.unique_jobs || []);
            setAllRawJobs(activeSnapshot.raw_jobs || []);
            setSearchStats({
                total_found: activeSnapshot.total_raw_found || (activeSnapshot.raw_jobs || []).length,
                unique_count: activeSnapshot.total_unique_found || (activeSnapshot.unique_jobs || []).length
            });
            setJobScope("curated");
            if (activeSnapshot.role) setRole(activeSnapshot.role);
            setFilterKeyword("");
            if (activeSnapshot.location && activeSnapshot.location !== 'Remote' && activeSnapshot.location !== 'Worldwide') {
                setFilterLocationInput(activeSnapshot.location);
            }
        }
    }, [activeSnapshot]);

    // RAG AI Query State
    const [ragModalOpen, setRagModalOpen] = useState(false);
    const [ragQuery, setRagQuery] = useState("");
    const [ragAnswer, setRagAnswer] = useState("");
    const [ragLoading, setRagLoading] = useState(false);

    // Exporting Insights CSV State
    const [exportingInsights, setExportingInsights] = useState(false);
    const [isHarvestingLive, setIsHarvestingLive] = useState(false);
    const [csvMenuOpen, setCsvMenuOpen] = useState(false);

    // ==========================================
    // High-Capacity Offline Storage (IndexedDB + LocalStorage Fallback)
    // Reliably stores thousands of accumulated jobs without 5MB quota errors
    // ==========================================
    const JobDB = {
        dbName: "JobHuntDB",
        storeName: "saved_pool",
        version: 1,
        
        getDB() {
            return new Promise((resolve) => {
                if (typeof window === "undefined" || !window.indexedDB) return resolve(null);
                const req = indexedDB.open(this.dbName, this.version);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
        },

        async savePool(data) {
            try {
                const db = await this.getDB();
                if (db) {
                    return new Promise((resolve) => {
                        const tx = db.transaction(this.storeName, "readwrite");
                        const store = tx.objectStore(this.storeName);
                        store.put(data, "current_pool");
                        tx.oncomplete = () => resolve(true);
                        tx.onerror = () => resolve(false);
                    });
                }
            } catch (e) {
                console.warn("IndexedDB save notice:", e);
            }
            // Fallback to localStorage with lightweight summaries
            try {
                localStorage.setItem("jobhunt_cached_search", JSON.stringify({
                    search_id: data.search_id || "",
                    matched: (data.matched || []).slice(0, 100),
                    unique: (data.unique || []).slice(0, 300),
                    raw: (data.raw || []).slice(0, 500),
                    stats: data.stats
                }));
            } catch (e) {}
        },

        async loadPool() {
            try {
                const db = await this.getDB();
                if (db) {
                    const result = await new Promise((resolve) => {
                        const tx = db.transaction(this.storeName, "readonly");
                        const store = tx.objectStore(this.storeName);
                        const req = store.get("current_pool");
                        req.onsuccess = () => resolve(req.result || null);
                        req.onerror = () => resolve(null);
                    });
                    if (result && (result.raw?.length || result.unique?.length || result.matched?.length)) {
                        return result;
                    }
                }
            } catch (e) {
                console.warn("IndexedDB load notice:", e);
            }
            // Fallback load from localStorage
            try {
                const saved = localStorage.getItem("jobhunt_cached_search");
                if (saved) return JSON.parse(saved);
            } catch (e) {}
            return null;
        },

        async clearPool() {
            try {
                const db = await this.getDB();
                if (db) {
                    const tx = db.transaction(this.storeName, "readwrite");
                    const store = tx.objectStore(this.storeName);
                    store.delete("current_pool");
                }
            } catch (e) {}
            try {
                localStorage.removeItem("jobhunt_cached_search");
            } catch (e) {}
        }
    };

    // Helper to merge new incoming jobs with existing accumulated jobs without duplicates
    const mergeJobList = (existingList = [], incomingList = []) => {
        const map = new Map();
        // Add newest incoming first
        for (const item of (incomingList || [])) {
            if (!item) continue;
            const key = (item.url || item.job_url || `${item.title}-${item.company}-${item.location}`).toLowerCase().trim();
            if (key && !map.has(key)) {
                map.set(key, item);
            }
        }
        // Then add existing items
        for (const item of (existingList || [])) {
            if (!item) continue;
            const key = (item.url || item.job_url || `${item.title}-${item.company}-${item.location}`).toLowerCase().trim();
            if (key && !map.has(key)) {
                map.set(key, item);
            }
        }
        return Array.from(map.values());
    };

    // Helper to persist search results in IndexedDB so they never disappear across reloads
    const persistSearchData = (sId, matched, unique, raw, stats) => {
        JobDB.savePool({
            search_id: sId || "",
            matched: matched || [],
            unique: unique || [],
            raw: raw || [],
            stats: stats || { total_found: (raw || []).length, unique_count: (unique || []).length }
        });
    };

    // Handler to clear accumulated job pool
    const handleClearJobPool = () => {
        if (window.confirm("Are you sure you want to clear your accumulated job pool?")) {
            setAllMatchedJobs([]);
            setAllUniqueJobs([]);
            setAllRawJobs([]);
            allMatchedJobsRef.current = [];
            allUniqueJobsRef.current = [];
            allRawJobsRef.current = [];
            setCurrentSearchId("");
            setSearchStats({ total_found: 0, unique_count: 0 });
            JobDB.clearPool();
            try {
                localStorage.removeItem("jobhunt_active_search_id");
            } catch (e) {}
            showToast("Job pool cleared. Ready for fresh location harvests!");
        }
    };

    // Keep-Alive Heartbeat: Send /health ping every 50 seconds to keep Render free backend awake
    useEffect(() => {
        const keepAlivePing = () => {
            fetch(`${API_BASE_URL}/api/v1/health`, { cache: 'no-store' }).catch(() => { });
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

            // Load full accumulated pool from IndexedDB and sync with latest server-side background discoveries
            JobDB.loadPool().then((savedSearch) => {
                let initialMatched = savedSearch?.matched || [];
                let initialUnique = savedSearch?.unique || [];
                let initialRaw = savedSearch?.raw || [];

                if (initialMatched.length) {
                    setAllMatchedJobs(initialMatched);
                    allMatchedJobsRef.current = initialMatched;
                }
                if (initialUnique.length) {
                    setAllUniqueJobs(initialUnique);
                    allUniqueJobsRef.current = initialUnique;
                }
                if (initialRaw.length) {
                    setAllRawJobs(initialRaw);
                    allRawJobsRef.current = initialRaw;
                }
                if (savedSearch?.stats) setSearchStats(savedSearch.stats);

                // Fetch latest server-side background discoveries & automation history
                fetch(`${API_BASE_URL}/api/v1/jobs/latest-pool`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.jobs && data.jobs.length > 0) {
                            const mergedMatched = mergeJobList(allMatchedJobsRef.current, data.jobs || []);
                            const mergedUnique = mergeJobList(allUniqueJobsRef.current, data.unique_jobs || data.jobs || []);
                            const mergedRaw = mergeJobList(allRawJobsRef.current, data.raw_jobs || data.jobs || []);

                            allMatchedJobsRef.current = mergedMatched;
                            allUniqueJobsRef.current = mergedUnique;
                            allRawJobsRef.current = mergedRaw;

                            setAllMatchedJobs(mergedMatched);
                            setAllUniqueJobs(mergedUnique);
                            setAllRawJobs(mergedRaw);

                            const newStats = {
                                total_found: mergedRaw.length,
                                unique_count: mergedUnique.length
                            };
                            setSearchStats(newStats);
                            persistSearchData("", mergedMatched, mergedUnique, mergedRaw, newStats);
                        }
                    })
                    .catch(() => {});
            });

            // Restore active search ID for continuous live streaming if in-progress
            const savedSearchId = localStorage.getItem("jobhunt_active_search_id");
            if (savedSearchId) {
                setCurrentSearchId(savedSearchId);
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
        } catch (e) { }
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
        } catch (e) { }
    }, [jobScope, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

    // Execute Search across 9 platforms directly targeted to active user filters (retains previous results until fresh ones arrive)
    const executeSearch = async (overrideFile = null, overrideRole = null, overrideLocation = null) => {
        setSearching(true);
        setIsHarvestingLive(false);

        const activeRole = (overrideRole || role || "Software Engineer").trim();
        const activeLocation = (overrideLocation !== null ? overrideLocation : filterLocationInput).trim() || "Worldwide";

        let activeSeniority = "mid";
        let searchRole = activeRole;
        if (filterSeniority !== "all") {
            activeSeniority = filterSeniority;
        } else if (filterExpYears !== "all") {
            if (filterExpYears === "0") {
                activeSeniority = "intern";
                if (!searchRole.toLowerCase().includes("intern")) searchRole = `${searchRole} Intern`;
            } else if (filterExpYears === "1" || filterExpYears === "2") {
                activeSeniority = "entry_level";
                if (!searchRole.toLowerCase().includes("junior") && !searchRole.toLowerCase().includes("entry")) searchRole = `Junior ${searchRole}`;
            } else if (filterExpYears === "3-5") {
                activeSeniority = "mid";
            } else if (filterExpYears === "5+" || filterExpYears === "8+") {
                activeSeniority = "senior";
                if (!searchRole.toLowerCase().includes("senior")) searchRole = `Senior ${searchRole}`;
            }
        } else if (resumeProfile?.seniority) {
            activeSeniority = resumeProfile.seniority.toLowerCase();
        }

        const activeRemote = filterWorkMode !== "all" ? filterWorkMode : "any";

        const formData = new FormData();
        formData.append("role", searchRole);
        formData.append("location", activeLocation);
        formData.append("experience_level", activeSeniority);
        formData.append("remote_preference", activeRemote);

        const fileToUpload = overrideFile || resumeFile;
        if (fileToUpload) {
            formData.append("resume", fileToUpload);
        }
        if (resumeProfile) {
            formData.append("resume_profile", JSON.stringify(resumeProfile));
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
                try {
                    localStorage.setItem("jobhunt_active_search_id", data.search_id);
                } catch (e) {}

                const incomingMatched = data.jobs || [];
                const incomingUnique = data.unique_jobs || data.all_jobs || incomingMatched;
                const incomingRaw = data.raw_jobs || incomingUnique;

                // Accumulate and combine with existing jobs using synchronous refs
                const mergedMatched = mergeJobList(allMatchedJobsRef.current, incomingMatched);
                const mergedUnique = mergeJobList(allUniqueJobsRef.current, incomingUnique);
                const mergedRaw = mergeJobList(allRawJobsRef.current, incomingRaw);

                allMatchedJobsRef.current = mergedMatched;
                allUniqueJobsRef.current = mergedUnique;
                allRawJobsRef.current = mergedRaw;

                setAllMatchedJobs(mergedMatched);
                setAllUniqueJobs(mergedUnique);
                setAllRawJobs(mergedRaw);

                const newStats = {
                    total_found: mergedRaw.length,
                    unique_count: mergedUnique.length
                };
                setSearchStats(newStats);

                // Save combined pool reliably to IndexedDB and localStorage
                persistSearchData(data.search_id, mergedMatched, mergedUnique, mergedRaw, newStats);

                // Start continuous background harvesting
                setIsHarvestingLive(true);
                showToast(`Harvested ${data.total_found || incomingRaw.length} postings for ${activeLocation} (Total pool: ${mergedRaw.length}) -> streaming more!`);
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
        const maxPolls = 35; // 35 polls * 2s = ~70s of continuous streaming

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
                        const streamMergedRaw = mergeJobList(allRawJobsRef.current, data.raw_jobs || []);
                        const streamMergedUnique = mergeJobList(allUniqueJobsRef.current, data.unique_jobs || []);
                        const streamMergedMatched = mergeJobList(allMatchedJobsRef.current, data.jobs || []);

                        allRawJobsRef.current = streamMergedRaw;
                        allUniqueJobsRef.current = streamMergedUnique;
                        allMatchedJobsRef.current = streamMergedMatched;

                        setAllRawJobs(streamMergedRaw);
                        setAllUniqueJobs(streamMergedUnique);
                        setAllMatchedJobs(streamMergedMatched);

                        const updatedStats = {
                            total_found: streamMergedRaw.length,
                            unique_count: streamMergedUnique.length
                        };
                        setSearchStats(updatedStats);

                        // Persist combined live streaming updates reliably
                        persistSearchData(currentSearchId, streamMergedMatched, streamMergedUnique, streamMergedRaw, updatedStats);

                        // Keep modal contacts synced
                        if (data.jobs && data.jobs.length > 0) {
                            setSelectedJob(prev => {
                                if (!prev) return null;
                                const updated = data.jobs.find(j => j.id === prev.id) || (data.unique_jobs || []).find(j => j.id === prev.id);
                                return updated || prev;
                            });
                        }
                    }

                    if (data.status === 'completed' && pollCount > 6) {
                        setIsHarvestingLive(false);
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) { }
        }, 2000);

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
                } catch (err) { }

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
        } catch (err) { }
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
        } else if (scope === "applied") {
            jobsList = appliedJobs;
            filenamePrefix = "applied_jobs_tracker";
            scopeLabel = "Applied Jobs";
        } else if (scope === "filtered") {
            jobsList = filteredJobs;
            filenamePrefix = "filtered_view_jobs";
            scopeLabel = "Filtered View";
        }

        if (!jobsList || jobsList.length === 0) {
            showToast(`No jobs available to export in ${scopeLabel}.`, "error");
            return;
        }

        generateJobsCSV(jobsList, scopeLabel, filenamePrefix);
        showToast(`Exported ${jobsList.length} ${scopeLabel} jobs to CSV!`);
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
        setAppliedJobs(prev => prev.map(j => getJobKey(j) === getJobKey(updatedJob) ? { ...updatedJob, applied_at: j.applied_at } : j));
        setSelectedJob(updatedJob);
    };

    // Filter & Sort Logic for Selected Pool (Curated, Unique, Raw, or Applied)
    const filteredJobs = useMemo(() => {
        let sourceList = [];
        if (jobScope === 'raw') {
            sourceList = (allRawJobs && allRawJobs.length > 0) ? allRawJobs : ((allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : allMatchedJobs);
        } else if (jobScope === 'unique') {
            sourceList = (allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : ((allRawJobs && allRawJobs.length > 0) ? allRawJobs : allMatchedJobs);
        } else if (jobScope === 'curated') {
            sourceList = (allMatchedJobs && allMatchedJobs.length > 0) ? allMatchedJobs : ((allUniqueJobs && allUniqueJobs.length > 0) ? allUniqueJobs : allRawJobs);
        } else if (jobScope === 'applied') {
            sourceList = appliedJobs;
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
                    const matchesAlias = aliases.some(alias => jobLoc.includes(alias)) || jobLoc.includes(locQuery) || jobLoc.includes('remote') || jobLoc.includes('anywhere');
                    if (!matchesAlias) return false;
                } else {
                    const tokens = locQuery.split(/[,\s/]+/).filter(t => t.length >= 2);
                    const matchesTokens = tokens.length > 0 ? tokens.some(t => jobLoc.includes(t)) : jobLoc.includes(locQuery);
                    if (!matchesTokens && !jobLoc.includes(locQuery) && !jobLoc.includes('remote') && !jobLoc.includes('anywhere')) return false;
                }
            }

            // 3. Work Mode
            const isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || source === 'jobicy' || source === 'remoteok' || jobLoc.includes('anywhere');
            const isHybrid = jobLoc.includes('hybrid') || desc.includes('hybrid') || desc.includes('days in office') || desc.includes('days a week in office') || desc.includes('days per week in office');
            const isOnsite = !isRemote && !isHybrid;

            if (filterWorkMode === 'remote' && !isRemote) return false;
            if (filterWorkMode === 'hybrid' && !isHybrid) return false;
            if (filterWorkMode === 'onsite' && !isOnsite) return false;

            // 4. Min Score (Only apply score cutoff in 'curated' matches mode, never in raw, unique, or applied scopes)
            if (jobScope === 'curated' && minScore > 0 && (job.match_score || 0) < minScore) {
                return false;
            }

            // 5. Granular Experience Level & Seniority Fit (Only apply if explicitly selected by user)
            if (filterExpYears !== 'all' || filterSeniority !== 'all') {
                const minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;
                const isTrueIntern = title.includes('intern') || title.includes('internship') || title.includes('trainee') || title.includes('apprentice') || title.includes('co-op') || title.includes('student') || fit.includes('intern') || expReq.includes('intern');
                const isSeniorRole = title.includes('senior') || title.includes('sr.') || title.includes('sr ') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || fit.includes('senior') || fit.includes('lead') || minYears >= 5;
                const isEntryRole = (title.includes('entry') || title.includes('fresher') || title.includes('graduate') || title.includes('new grad') || expReq.includes('0-1') || expReq.includes('1 yr') || minYears === 0 || minYears === 1) && !isSeniorRole;
                const isJuniorRole = (title.includes('junior') || title.includes('jr.') || title.includes('associate') || expReq.includes('1-2') || expReq.includes('2 yr') || minYears === 2) && !isSeniorRole;
                const requiresYears = minYears >= 2 || desc.includes('2+ year') || desc.includes('3+ year') || desc.includes('4+ year') || desc.includes('5+ year') || desc.includes('2-4 year') || desc.includes('3-5 year');

                if (filterExpYears === '0' && (!isTrueIntern || requiresYears || isSeniorRole)) return false;
                if (filterExpYears === '1' && (!isEntryRole || isTrueIntern || isSeniorRole || minYears > 1)) return false;
                if (filterExpYears === '2' && (!isJuniorRole || isTrueIntern || isSeniorRole || minYears > 2)) return false;
                if (filterExpYears === '3-5' && (minYears < 2 || minYears > 5 || isTrueIntern || title.includes('principal') || title.includes('staff'))) return false;
                if (filterExpYears === '5+' && (!isSeniorRole && minYears < 4)) return false;
                if (filterExpYears === '8+' && (minYears < 7 && !title.includes('lead') && !title.includes('principal') && !title.includes('staff'))) return false;

                // Seniority dropdown fallback
                if (filterSeniority === 'intern' && (!isTrueIntern || requiresYears || isSeniorRole)) return false;
                if (filterSeniority === 'junior' && (!isJuniorRole && !isEntryRole || isSeniorRole)) return false;
                if (filterSeniority === 'senior' && !isSeniorRole) return false;
            }

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
    }, [jobScope, allMatchedJobs, allUniqueJobs, allRawJobs, appliedJobs, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

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
            {/* Historical Automation Snapshot Banner */}
            {activeSnapshot && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0">
                            📜
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Historical Automation Digest Snapshot
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Offline Interactive View
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Viewing digest for <strong className="text-white font-semibold">"{activeSnapshot.role}"</strong> in <span className="text-indigo-300 font-medium">{activeSnapshot.location || 'Remote'}</span> sent on {activeSnapshot.sent_at ? new Date(activeSnapshot.sent_at).toLocaleString() : 'Recent'} ({allMatchedJobs.length} Curated / {allRawJobs.length} Raw). All filters and contacts work interactively without re-scraping!
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            onExitSnapshot?.();
                            JobDB.loadPool().then(saved => {
                                if (saved) {
                                    setAllMatchedJobs(saved.matched || []);
                                    setAllUniqueJobs(saved.unique || []);
                                    setAllRawJobs(saved.raw || []);
                                    setSearchStats(saved.stats || { total_found: (saved.raw || []).length, unique_count: (saved.unique || []).length });
                                }
                            });
                            showToast("Exited historical snapshot. Restored live pool.");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 text-xs font-bold shrink-0 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span>✕</span>
                        <span>Exit Snapshot</span>
                    </button>
                </div>
            )}
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
            {(allMatchedJobs.length > 0 || allUniqueJobs.length > 0 || allRawJobs.length > 0 || appliedJobs.length > 0) && (
                <div className="space-y-5">
                    {/* Summary Stat Banner & Export Bar */}
                    <div className="minimal-card rounded-xl p-4 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setJobScope("raw")}
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${jobScope === "raw"
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
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${jobScope === "unique"
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
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${jobScope === "curated"
                                        ? "bg-emerald-600/25 border-emerald-500/70 shadow-sm"
                                        : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80"
                                    }`}
                            >
                                <div className="text-[10px] text-slate-400 font-medium">Curated Matches</div>
                                <div className="text-base sm:text-lg font-bold text-emerald-400">{allMatchedJobs.length}</div>
                            </button>

                            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                            <button
                                type="button"
                                onClick={() => setJobScope("applied")}
                                className={`text-left px-3 py-1.5 rounded-xl border transition-all ${jobScope === "applied"
                                        ? "bg-emerald-600/30 border-emerald-400 shadow-sm ring-1 ring-emerald-500/50"
                                        : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80"
                                    }`}
                            >
                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <span className="text-emerald-400">✓</span> Applied Tracker
                                </div>
                                <div className="text-base sm:text-lg font-bold text-emerald-300">{appliedJobs.length}</div>
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
                                                onClick={() => exportJobsToCSV("applied")}
                                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-emerald-400">✓</span>
                                                    <div>
                                                        <div className="font-semibold text-emerald-300">Applied Jobs CSV</div>
                                                        <div className="text-[10px] text-slate-400">All positions you marked as applied</div>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                                    {appliedJobs.length}
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
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                    📦 Job Pool / Scope
                                </label>
                                <select
                                    value={jobScope}
                                    onChange={(e) => setJobScope(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-emerald-300"
                                >
                                    <option value="curated">🎯 Curated ({allMatchedJobs.length || 0})</option>
                                    <option value="unique">🧬 Unique ({allUniqueJobs.length || searchStats.unique_count})</option>
                                    <option value="raw">🌐 Raw ({allRawJobs.length || searchStats.total_found})</option>
                                </select>
                            </div>

                            {/* Work Mode / Workplace Filter */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                                    💼 Work Mode
                                </label>
                                <select
                                    value={filterWorkMode}
                                    onChange={(e) => {
                                        setFilterWorkMode(e.target.value);
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-cyan-300"
                                >
                                    <option value="all">🌐 All Modes</option>
                                    <option value="remote">🏠 Remote (WFH)</option>
                                    <option value="hybrid">🔄 Hybrid</option>
                                    <option value="onsite">🏢 Onsite / Office</option>
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
                                    <option value="score">⭐ Highest Match</option>
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
                                    className={`px-2 py-0.5 rounded-md transition-all font-medium ${(filterLocationInput.toLowerCase() === hub.val || (!filterLocationInput && hub.val === ""))
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

                            {/* Reset & Clear Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 sm:pt-0">
                                {allRawJobs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearJobPool}
                                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        <span>🗑️</span> Clear Pool ({allRawJobs.length})
                                    </button>
                                )}
                                {(filterKeyword || filterLocationInput || filterExpYears !== 'all' || filterWorkMode !== 'all' || filterDate !== 'all' || filterSeniority !== 'all' || filterSource !== 'all' || minScore > 0) && (
                                    <button
                                        type="button"
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
                                        <span>↺</span> Reset Filters
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
                        <div className="minimal-card rounded-xl p-8 sm:p-10 text-center border border-white/[0.08] space-y-4 shadow-xl">
                            <div className="text-3xl">🔍</div>
                            <div>
                                <h3 className="text-base font-bold text-white">No jobs in local dataset match current filter combination</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {filterLocationInput ? `Looking for roles in "${filterLocationInput}"? Click below to launch a live multi-platform harvest specifically for ${filterLocationInput}.` : 'Try resetting filters or click below to trigger a live multi-board search.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                <button
                                    onClick={() => executeSearch(null, null, filterLocationInput)}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                                >
                                    <span>⚡</span>
                                    <span>Live-Harvest "{role}" {filterLocationInput ? `in ${filterLocationInput}` : 'Worldwide'} Now</span>
                                </button>

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
                                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition-all"
                                >
                                    ↺ Reset All Filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredJobs.map((job, idx) => (
                                <JobCard
                                    key={job.id || idx}
                                    job={job}
                                    jobScope={jobScope}
                                    resumeSkills={resumeProfile?.skills || []}
                                    isApplied={appliedJobKeys.has(getJobKey(job))}
                                    onToggleApplied={onToggleApplied}
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
                    isApplied={appliedJobKeys.has(getJobKey(selectedJob))}
                    onToggleApplied={onToggleApplied}
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
                                <span>🤖</span>
                                <span>AI Job Assistant (RAG)</span>
                            </h3>
                            <button onClick={() => setRagModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
                        </div>

                        <form onSubmit={handleAskAI} className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask anything about the requirements, tech stack, or hiring..."
                                    value={ragQuery}
                                    onChange={(e) => setRagQuery(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none pr-20"
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

            {/* Floating Mobile Corner Button for Applied Jobs */}
            <button
                type="button"
                onClick={onOpenAppliedModal}
                className="fixed bottom-5 right-5 z-40 sm:hidden px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-1.5 border border-emerald-300/40 backdrop-blur-md active:scale-95 transition-all shadow-emerald-950"
            >
                <span className="text-sm">✓</span>
                <span>Applied ({appliedJobs.length})</span>
            </button>
        </div>
    );
}

// ==========================================
// Helper: Extract & Format Matched / Missing Skills from Parsed Resume
// ==========================================
function getJobSkillLists(job, resumeSkills = []) {
    if (!job) return { matched: [], missing: [] };

    let matched = (job.matching_skills && Array.isArray(job.matching_skills) && job.matching_skills.length > 0)
        ? [...job.matching_skills]
        : [];
    let missing = (job.missing_skills && Array.isArray(job.missing_skills) && job.missing_skills.length > 0)
        ? [...job.missing_skills]
        : [];

    // Match directly against candidate's parsed resume skills
    if (matched.length === 0 && resumeSkills && resumeSkills.length > 0) {
        const text = `${job.title || ''} ${job.description || ''} ${job.key_requirements || ''}`.toLowerCase();
        for (const s of resumeSkills) {
            if (!s) continue;
            const sClean = String(s).trim();
            if (!sClean) continue;
            if (text.includes(sClean.toLowerCase())) {
                if (!matched.includes(sClean)) matched.push(sClean);
            } else {
                if (!missing.includes(sClean)) missing.push(sClean);
            }
        }
    }

    return { matched, missing };
}

// ==========================================
// Component: Single Job Card (Minimal Aesthetic)
// ==========================================
function JobCard({ job, jobScope = "curated", resumeSkills = [], isApplied = false, onToggleApplied, onViewDetails, onQueryAI }) {
    const score = Math.round(job.match_score || 0);
    let badgeText = `${score}% Match`;
    let scoreColor = "bg-slate-800 text-slate-300 border-slate-700";

    if (jobScope === "raw") {
        badgeText = "🌐 Raw Listing";
        scoreColor = "bg-slate-900 text-slate-300 border-slate-700";
    } else if (jobScope === "unique") {
        badgeText = "🧬 Unique Role";
        scoreColor = "bg-indigo-950/60 text-indigo-300 border-indigo-500/30";
    } else if (jobScope === "applied") {
        badgeText = "✓ Applied";
        scoreColor = "bg-emerald-950/90 text-emerald-300 border-emerald-500/50";
    } else {
        if (score >= 80) scoreColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";
        else if (score >= 65) scoreColor = "bg-amber-950/60 text-amber-300 border-amber-500/30";
    }

    // Salary formatting
    let salaryDisplay = "Salary: N/A";
    if (job.salary_range) {
        const minS = job.salary_range.min;
        const maxS = job.salary_range.max;
        const curr = job.salary_range.currency || "$";
        if (minS && maxS) salaryDisplay = `${curr}${minS.toLocaleString()} - ${maxS.toLocaleString()}`;
        else if (minS) salaryDisplay = `> ${curr}${minS.toLocaleString()}`;
    }

    const { matched: cardMatchingSkills } = getJobSkillLists(job, resumeSkills);
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
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">
                            {job.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-200">🏢 {job.company || 'Company'}</span>
                            <span>•</span>
                            <span>📍 {job.location || 'Remote'}</span>
                            {isApplied && (
                                <>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-0.5">
                                        <span>✓</span> Applied
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Applied Toggle Checkmark */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleApplied?.(job);
                            }}
                            title={isApplied ? "Marked as Applied! Click to unmark" : "Click to mark as Applied"}
                            className={`px-2 py-1 rounded-md border text-xs font-bold transition-all flex items-center gap-1 ${
                                isApplied
                                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm"
                                    : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-slate-800"
                            }`}
                        >
                            <span className={isApplied ? "text-emerald-400 font-extrabold text-xs" : "text-slate-500 text-xs"}>
                                {isApplied ? "✓" : "○"}
                            </span>
                            <span className="text-[10px]">{isApplied ? "Applied" : "Apply"}</span>
                        </button>

                        <span className={`px-2 py-0.5 rounded-md border font-bold text-xs shrink-0 ${scoreColor}`}>
                            {badgeText}
                        </span>
                    </div>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {/* Exact Required Experience Badge */}
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                        ⏳ Exp: {getJobExperienceBadge(job)}
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
                {cardMatchingSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center pt-0.5">
                        {cardMatchingSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-500/20">
                                ✓ {s}
                            </span>
                        ))}
                        {cardMatchingSkills.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{cardMatchingSkills.length - 3} more</span>
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
function JobDetailModal({ job, user, token, resumeSkills, isApplied = false, onToggleApplied, onClose, onUpdateJob, onOpenCookieModal, showToast }) {
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
                                {isApplied && (
                                    <>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                            <span>✓</span> Marked as Applied {job.applied_at ? `(${new Date(job.applied_at).toLocaleDateString()})` : ''}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onToggleApplied?.(job)}
                                title={isApplied ? "Marked as Applied! Click to unmark" : "Click to mark as Applied"}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                    isApplied
                                        ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm"
                                        : "bg-slate-800 text-slate-300 border-white/10 hover:border-emerald-500/50 hover:text-emerald-300"
                                }`}
                            >
                                <span className={isApplied ? "text-emerald-400 font-extrabold text-sm" : "text-slate-400 text-xs"}>
                                    {isApplied ? "✓" : "○"}
                                </span>
                                <span>{isApplied ? "Applied" : "Mark Applied"}</span>
                            </button>

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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'overview'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            📋 Overview & Insights
                        </button>
                        <button
                            onClick={() => setActiveTab("contacts")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'contacts'
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'outreach'
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
                                        {getJobExperienceBadge(job)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                    <div><strong className="text-slate-400">Experience Needed:</strong> <span className="text-white font-semibold">{getJobExperienceBadge(job)}</span></div>
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
                            {(() => {
                                const skillData = getJobSkillLists(job, resumeSkills);
                                return (
                                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-3">
                                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                            <span>🛠️ Skill Alignment Matrix</span>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                Matched: <strong className="text-emerald-400">{skillData.matched.length}</strong> • Skill Gaps: <strong className="text-amber-400">{skillData.missing.length}</strong>
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {skillData.matched.length > 0 && (
                                                <div>
                                                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mb-1.5">
                                                        <span>✓</span>
                                                        <span>Matched Competencies & Tools ({skillData.matched.length}):</span>
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {skillData.matched.map((s, i) => (
                                                            <span key={i} className="px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium shadow-sm flex items-center gap-1">
                                                                <span className="text-emerald-400 font-bold">✓</span> {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {skillData.missing.length > 0 && (
                                                <div>
                                                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mb-1.5">
                                                        <span>!</span>
                                                        <span>Target Gaps & Secondary Requirements ({skillData.missing.length}):</span>
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {skillData.missing.map((s, i) => (
                                                            <span key={i} className="px-2.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[11px] font-medium shadow-sm flex items-center gap-1">
                                                                <span className="text-amber-400 font-bold">!</span> {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

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
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-slate-300">
                                            Found {hrContacts.length} HR Contacts + {techContacts.length} Tech Leads
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.company + ' talent')}&origin=SWITCH_SEARCH_VERTICAL`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1 shadow-sm"
                                                title={`Search all ${job.company} employees on LinkedIn`}
                                            >
                                                <span>👥</span>
                                                <span>View All on LinkedIn</span>
                                            </a>
                                            <button
                                                onClick={handleFetchContacts}
                                                disabled={fetchingContacts}
                                                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <span>↻</span>
                                                <span>{fetchingContacts ? "Refreshing..." : "Refresh"}</span>
                                            </button>
                                        </div>
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

                                                {/* WhatsApp / InMail Draft */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp / InMail Quick Pitch:</span>
                                                        <button
                                                            onClick={() => copyToClipboard(draft.inmail_message || '', "Copied InMail Pitch!")}
                                                            className="text-indigo-400 hover:underline text-[11px]"
                                                        >
                                                            📋 Copy Pitch
                                                        </button>
                                                    </div>
                                                    <div className="bg-slate-950 p-2.5 rounded-lg border border-white/[0.04] text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                        {draft.inmail_message || "Message draft will appear here."}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
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
                            type="button"
                            onClick={() => onToggleApplied?.(job)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isApplied
                                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm"
                                    : "bg-slate-800 text-slate-200 border-white/10 hover:border-emerald-500/40 hover:text-emerald-300"
                            }`}
                        >
                            <span className={isApplied ? "text-emerald-400 font-extrabold text-sm" : "text-slate-400 text-xs"}>
                                {isApplied ? "✓" : "○"}
                            </span>
                            <span>{isApplied ? "Marked as Applied" : "Mark as Applied"}</span>
                        </button>

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
                                onClick={() => {
                                    if (!isApplied && onToggleApplied) {
                                        onToggleApplied(job);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
                            >
                                <span>Apply on Career Page ↗</span>
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

    const isSearchUrl = (contact.profile_url || "").includes("/search/results/people");

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
                    <span>{isSearchUrl ? "👥" : "🔗"}</span>
                    <span>{isSearchUrl ? "Search People on LinkedIn" : "LinkedIn Profile"}</span>
                </a>
            )}
        </div>
    );
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView({ token, user, cookieStatusInfo, onOpenCookieModal, showToast, onInspectSnapshot }) {
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

    const [historyList, setHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [inspectingId, setInspectingId] = useState(null);

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

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.history) {
                setHistoryList(data.history || []);
            }
        } catch (err) {
            console.error("Fetch history error:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchAlerts(), fetchHistory()]);
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
        if (resumeProfile?.skills) {
            formData.append("skills_json", JSON.stringify(resumeProfile.skills));
        }
        if (resumeProfile?.summary) {
            formData.append("resume_summary", resumeProfile.summary);
        }
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
                if (data.alert) {
                    setActiveAlerts(prev => [data.alert, ...prev.filter(a => a.id !== data.alert.id)]);
                }
                fetchHistory();
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
                fetchHistory();
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
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
        showToast("Alert automation removed.");

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                fetchAlerts();
            }
        } catch (err) {
            fetchAlerts();
            showToast(err.message, "error");
        }
    };

    const handleDeleteHistory = async (historyId) => {
        setHistoryList(prev => prev.filter(h => h.id !== historyId));
        showToast("Automation digest history snapshot removed.");

        try {
            await fetch(`${API_BASE_URL}/api/v1/alerts/history/${historyId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            fetchHistory();
        }
    };

    const handleInspectClick = async (historyId) => {
        try {
            setInspectingId(historyId);
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/history/${historyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.history) {
                if (onInspectSnapshot) {
                    onInspectSnapshot(data.history);
                }
                showToast(`Loaded snapshot for "${data.history.role}" (${data.history.curated_jobs?.length || 0} curated jobs)!`);
            } else {
                showToast("Failed to load historical snapshot.", "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setInspectingId(null);
        }
    };

    const handleDownloadHistoryCSV = async (historyId, type = 'curated') => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/alerts/history/${historyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.history) {
                const list = type === 'raw' ? (data.history.raw_jobs || []) : (data.history.curated_jobs || []);
                const label = type === 'raw' ? "Raw Harvested" : "Curated Matches";
                const prefix = `${type}_digest_${(data.history.role || 'jobs').replace(/[^a-zA-Z0-9]/g, '_')}`;
                generateJobsCSV(list, label, prefix);
                showToast(`Downloaded ${label} CSV (${list.length} jobs)`);
            } else {
                showToast("Failed to export historical CSV.", "error");
            }
        } catch (err) {
            showToast("Error generating CSV: " + err.message, "error");
        }
    };

    return (
        <div className="space-y-6">
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

            {/* Automation Digest History & Sent Job Snapshots */}
            <div className="minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                    <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                            <span>📜</span>
                            <span>Sent Automation History & Job Snapshots</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Every email digest sent to your inbox is saved here. Inspect curated matches and raw databases interactively on the website with complete search and filter capabilities.
                        </p>
                    </div>
                    <button
                        onClick={fetchHistory}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <span>↻</span>
                        <span>Refresh History</span>
                    </button>
                </div>

                {loadingHistory ? (
                    <div className="text-center py-10 text-xs text-slate-500">Loading automation history...</div>
                ) : historyList.length === 0 ? (
                    <div className="p-8 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center space-y-2">
                        <div className="text-2xl">📬</div>
                        <div className="text-xs font-semibold text-slate-300">No automation digests sent yet</div>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                            Save an automation or click "Send Live Test Digest Now" above. When digests are dispatched, complete interactive snapshots will appear here for instant filtering and CSV export.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historyList.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] hover:border-indigo-500/30 transition-all space-y-3 shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-white text-sm">{item.role}</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                📍 {item.location || 'Remote'}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                            <span>🗓️ {item.sent_at ? new Date(item.sent_at).toLocaleString() : 'Recent'}</span>
                                            <span>•</span>
                                            <span className="text-slate-300">✉️ {item.recipient_email}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteHistory(item.id)}
                                        title="Delete snapshot"
                                        className="text-slate-500 hover:text-rose-400 text-xs p-1"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Filter parameters used during run */}
                                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5">
                                        Mode: {item.work_mode || 'any'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5">
                                        Exp: {item.experience_level || `${item.experience_years || 0} Yrs`}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5">
                                        Window: {item.max_age_days ? `${item.max_age_days}d` : '24h'}
                                    </span>
                                    {item.preferred_time && (
                                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5">
                                            Time: {item.preferred_time}
                                        </span>
                                    )}
                                </div>

                                {/* Job Counts Badges */}
                                <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                                        🎯 {item.total_curated_sent || 0} Curated
                                    </span>
                                    <span className="px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                                        🧬 {item.total_unique_found || 0} Unique
                                    </span>
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-slate-300 text-[11px] font-semibold">
                                        🌐 {item.total_raw_found || 0} Raw
                                    </span>
                                </div>

                                {/* Interactive Website Inspection & Direct CSV Download Actions */}
                                <div className="pt-2 flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => handleInspectClick(item.id)}
                                        disabled={inspectingId === item.id}
                                        className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                    >
                                        <span>🔍</span>
                                        <span>{inspectingId === item.id ? "Loading Snapshot..." : "Inspect & Filter on Website"}</span>
                                    </button>

                                    <button
                                        onClick={() => handleDownloadHistoryCSV(item.id, 'curated')}
                                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                                        title="Download Curated CSV"
                                    >
                                        📥 Curated CSV
                                    </button>

                                    <button
                                        onClick={() => handleDownloadHistoryCSV(item.id, 'raw')}
                                        className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all"
                                        title="Download Raw CSV"
                                    >
                                        📥 Raw CSV
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
                    <PasswordInput
                        required
                        placeholder="Initial password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
