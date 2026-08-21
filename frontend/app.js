const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.VITE_BACKEND_URL) {
        return window.__APP_CONFIG__.VITE_BACKEND_URL.trim().replace(/\/+$/, '');
    }
    return '';
};

const API_BASE_URL = getApiBaseUrl();

let currentSearchId = null;
let allFetchedJobs = [];
let parsedCandidateProfile = null;

// DOM Elements
const searchForm = document.getElementById('search-form');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.spinner');
const resumeInput = document.getElementById('resume-input');
const fileDropArea = document.getElementById('file-drop-area');
const fileMsg = document.getElementById('file-msg');
const statusCard = document.getElementById('status-card');
const statusTitle = document.getElementById('status-title');
const statusDesc = document.getElementById('status-desc');
const resultsSection = document.getElementById('results-section');
const statsSummary = document.getElementById('stats-summary');
const jobsGrid = document.getElementById('jobs-grid');
const exportCsvBtn = document.getElementById('export-csv-btn');

// Email Alert Elements
const alertForm = document.getElementById('alert-form');
const saveAlertBtn = document.getElementById('save-alert-btn');
const sendTestEmailBtn = document.getElementById('send-test-email-btn');
const openAlertModalBtn = document.getElementById('open-alert-modal-btn');
const activeAlertsList = document.getElementById('active-alerts-list');

// Candidate Banner Elements
const candidateBanner = document.getElementById('candidate-banner');
const candDomainPill = document.getElementById('cand-domain-pill');
const candExpPill = document.getElementById('cand-exp-pill');
const candSeniorityPill = document.getElementById('cand-seniority-pill');
const candSkillsChips = document.getElementById('cand-skills-chips');

// RAG Elements
const ragQueryInput = document.getElementById('rag-query-input');
const ragSendBtn = document.getElementById('rag-send-btn');
const ragResponseBox = document.getElementById('rag-response-box');
const ragResponseText = document.getElementById('rag-response-text');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Filter & Sort Elements
const filterKeyword = document.getElementById('filter-keyword');
const filterLocationSelect = document.getElementById('filter-location-select');
const filterWorkMode = document.getElementById('filter-work-mode');
const filterDate = document.getElementById('filter-date');
const filterMinScore = document.getElementById('filter-min-score');
const filterSeniority = document.getElementById('filter-seniority');
const filterSource = document.getElementById('filter-source');
const sortBy = document.getElementById('sort-by');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

// File Upload Interactions
resumeInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        fileMsg.textContent = `Selected: ${e.target.files[0].name}`;
        fileDropArea.classList.add('has-file');
    }
});

fileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropArea.classList.add('dragover');
});

fileDropArea.addEventListener('dragleave', () => {
    fileDropArea.classList.remove('dragover');
});

fileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        resumeInput.files = e.dataTransfer.files;
        fileMsg.textContent = `Selected: ${e.dataTransfer.files[0].name}`;
        fileDropArea.classList.add('has-file');
    }
});

// Form Submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const role = document.getElementById('role-input').value.trim();
    const location = document.getElementById('location-input').value.trim();
    const experience = parseFloat(document.getElementById('experience-input').value) || 0;
    const remoteOnly = document.getElementById('remote-toggle').checked;

    const preferences = {
        role: role,
        location: location,
        remote_preference: remoteOnly ? "remote" : "any",
        experience_years: experience,
        min_salary: null
    };

    const formData = new FormData();
    formData.append('preferences', JSON.stringify(preferences));

    if (resumeInput.files && resumeInput.files[0]) {
        formData.append('resume', resumeInput.files[0]);
    }

    setLoadingState(true);
    statusCard.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    candidateBanner.classList.add('hidden');
    statusTitle.textContent = `Targeting "${role}" in "${location || 'Anywhere'}"...`;
    statusDesc.textContent = `Querying LinkedIn, Indeed, Freehire, Himalayas, and Arbeitnow for '${role}' in '${location}'...`;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/search`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Search request failed with status: ${response.status}`);
        }

        const data = await response.json();
        currentSearchId = data.search_id;
        parsedCandidateProfile = data.parsed_profile;
        
        // Start polling for results
        pollSearchResults(currentSearchId);
    } catch (error) {
        console.error('Search error:', error);
        setLoadingState(false);
        statusTitle.textContent = "Search Error";
        statusDesc.textContent = `Failed to start job search: ${error.message}. Please verify the server is running.`;
    }
});

// Polling Search Results
async function pollSearchResults(searchId) {
    let attempts = 0;
    const maxAttempts = 60;

    const pollInterval = setInterval(async () => {
        attempts++;
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${searchId}`);
            if (!response.ok) return;

            const data = await response.json();

            if (data.status === 'completed') {
                clearInterval(pollInterval);
                setLoadingState(false);
                statusCard.classList.add('hidden');
                resultsSection.classList.remove('hidden');

                // Render candidate profile banner if present
                if (parsedCandidateProfile && parsedCandidateProfile.skills && parsedCandidateProfile.skills.length > 0) {
                    renderCandidateBanner(parsedCandidateProfile);
                }

                allFetchedJobs = data.jobs || [];
                applyFilters();
            } else if (data.status === 'failed') {
                clearInterval(pollInterval);
                setLoadingState(false);
                statusTitle.textContent = "Search Failed";
                statusDesc.textContent = "An error occurred during search execution. Please check terminal logs.";
            } else {
                if (attempts > 3) {
                    statusDesc.textContent = "Retrieving live postings from LinkedIn, Indeed, Freehire, and Himalayas...";
                }
                if (attempts > 6) {
                    statusDesc.textContent = "Deduplicating platform links & calculating precision match scores with Mistral AI...";
                }
            }

            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                setLoadingState(false);
                statusTitle.textContent = "Search Timed Out";
                statusDesc.textContent = "The search is taking longer than usual. Please check your backend terminal.";
            }
        } catch (err) {
            console.error('Polling error:', err);
        }
    }, 2000);
}

// Render Candidate Banner
function renderCandidateBanner(profile) {
    candidateBanner.classList.remove('hidden');
    if (candDomainPill) {
        candDomainPill.textContent = profile.core_domain || "Software Engineering";
    }
    candExpPill.textContent = `${profile.experience_years || 0} Yrs Experience`;
    candSeniorityPill.textContent = `${profile.seniority || 'Intern'} Level`;
    
    candSkillsChips.innerHTML = '';
    const skills = profile.skills || [];
    skills.slice(0, 15).forEach(skill => {
        const chip = document.createElement('span');
        chip.className = 'cand-skill-chip';
        chip.textContent = skill;
        candSkillsChips.appendChild(chip);
    });
}

// Render Job Cards
function renderJobs(jobs) {
    jobsGrid.innerHTML = '';

    if (!jobs || jobs.length === 0) {
        jobsGrid.innerHTML = `
            <div class="card glass" style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1.5rem;">
                <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
                <h3>No jobs match the current filter criteria</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem; margin-bottom: 1.25rem;">Try clearing or broadening your location, date, or score filters.</p>
                <button type="button" onclick="document.getElementById('reset-filters-btn').click()" class="btn btn-primary btn-sm">Reset All Filters</button>
            </div>
        `;
        return;
    }

    jobs.forEach(job => {
        const score = Math.round(job.match_score || 0);
        let scoreClass = 'score-low';
        if (score >= 75) scoreClass = 'score-high';
        else if (score >= 50) scoreClass = 'score-med';

        const card = document.createElement('div');
        card.className = 'job-card';

        const salaryText = job.salary_range 
            ? `${job.salary_range.currency || '$'}${job.salary_range.min ? job.salary_range.min.toLocaleString() : ''} - ${job.salary_range.max ? job.salary_range.max.toLocaleString() : ''}`
            : null;

        const postedDateText = job.posted_date ? `📅 ${job.posted_date}` : '📅 Recently Listed';
        const matchingSkills = job.matching_skills || [];
        const missingSkills = job.missing_skills || [];
        const expFit = job.experience_fit || "Good Fit";

        card.innerHTML = `
            <div class="job-card-header">
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
                <span class="job-score-badge ${scoreClass}">★ ${score}% Match</span>
            </div>

            <div class="job-company-row">
                <span class="company-name">🏢 ${escapeHtml(job.company || 'Unknown Company')}</span>
                <span>📍 ${escapeHtml(job.location || 'Remote')}</span>
            </div>

            <div class="job-meta-row">
                <span class="meta-tag source">🔗 ${escapeHtml(job.source || 'Aggregator')}</span>
                <span class="meta-tag date">${escapeHtml(postedDateText)}</span>
                <span class="meta-tag fit">💼 ${escapeHtml(expFit)}</span>
                <span class="meta-tag salary">💰 ${escapeHtml(salaryText || 'Salary: N/A')}</span>
            </div>

            ${(matchingSkills.length > 0 || missingSkills.length > 0) ? `
                <div class="skills-breakdown">
                    ${matchingSkills.length > 0 ? `
                        <div class="skills-group">
                            <span class="skills-label">Matched Skills:</span>
                            ${matchingSkills.map(s => `<span class="chip match">✓ ${escapeHtml(s)}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${missingSkills.length > 0 ? `
                        <div class="skills-group">
                            <span class="skills-label">Skill Gaps:</span>
                            ${missingSkills.map(s => `<span class="chip missing">+ ${escapeHtml(s)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${job.match_reason ? `
                <div class="job-match-reason">
                    <strong>Fit Breakdown:</strong> ${escapeHtml(job.match_reason)}
                </div>
            ` : ''}

            <div class="job-card-actions">
                <a href="${job.url || '#'}" target="_blank" rel="noopener noreferrer" class="btn-apply">
                    View & Apply ↗
                </a>
            </div>
        `;

        jobsGrid.appendChild(card);
    });
}

// Date Filter Helper
function isWithinDays(dateStr, days) {
    if (!dateStr) return true;
    try {
        const s = String(dateStr).trim().toLowerCase();
        if (s.includes('hour') || s.includes('minute') || s.includes('today') || s.includes('just now')) {
            return true;
        }
        if (s.includes('yesterday') || s.includes('1 day')) {
            return days >= 1;
        }
        if (s.includes('day')) {
            const match = s.match(/(\d+)\s*day/);
            if (match) {
                return parseInt(match[1]) <= days;
            }
        }
        const jobDate = new Date(dateStr);
        if (isNaN(jobDate.getTime())) return true;
        const now = new Date();
        const diffDays = (now - jobDate) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
    } catch {
        return true;
    }
}

// Filter and Sort Engine
function applyFilters() {
    const keyword = filterKeyword.value.toLowerCase().trim();
    const locFilter = filterLocationSelect ? filterLocationSelect.value.toLowerCase() : 'all';
    const workMode = filterWorkMode ? filterWorkMode.value : 'all';
    const dateFilter = filterDate.value;
    const minScore = parseFloat(filterMinScore.value) || 0;
    const seniorityFilter = filterSeniority ? filterSeniority.value : 'all';
    const source = filterSource.value.toLowerCase();
    const sortMode = sortBy.value;

    let activeFilterLabels = [];

    let filtered = allFetchedJobs.filter(job => {
        // 1. Keyword search (Title, Company, Skills, Description, Location)
        const matchTitle = (job.title || '').toLowerCase().includes(keyword);
        const matchCompany = (job.company || '').toLowerCase().includes(keyword);
        const matchSkills = (job.matching_skills || []).some(s => s.toLowerCase().includes(keyword));
        const matchLoc = (job.location || '').toLowerCase().includes(keyword);
        const matchDesc = (job.description || '').toLowerCase().includes(keyword);
        const matchesKeyword = !keyword || matchTitle || matchCompany || matchSkills || matchLoc || matchDesc;

        // 2. Location Select Filter
        let matchesLocSelect = true;
        const jobLoc = (job.location || '').toLowerCase();
        if (locFilter === 'india') {
            matchesLocSelect = jobLoc.includes('india') || jobLoc.includes('pune') || jobLoc.includes('bangalore') || jobLoc.includes('mumbai') || jobLoc.includes('delhi') || jobLoc.includes('hyderabad') || jobLoc.includes('noida') || jobLoc.includes('bhubaneswar') || jobLoc.includes('chennai');
        } else if (locFilter === 'pune') {
            matchesLocSelect = jobLoc.includes('pune');
        } else if (locFilter === 'us') {
            matchesLocSelect = jobLoc.includes('united states') || jobLoc.includes('usa') || jobLoc.includes('us') || jobLoc.includes('san francisco') || jobLoc.includes('new york') || jobLoc.includes('california') || jobLoc.includes('texas') || jobLoc.includes('remote, us');
        } else if (locFilter === 'uk') {
            matchesLocSelect = jobLoc.includes('united kingdom') || jobLoc.includes('uk') || jobLoc.includes('london') || jobLoc.includes('manchester');
        } else if (locFilter === 'germany') {
            matchesLocSelect = jobLoc.includes('germany') || jobLoc.includes('berlin') || jobLoc.includes('munich') || jobLoc.includes('europe');
        } else if (locFilter === 'remote') {
            matchesLocSelect = jobLoc.includes('remote') || jobLoc.includes('wfh') || (job.source || '').includes('himalayas') || jobLoc === '';
        }

        // 3. Work Mode Filter
        let matchesWorkMode = true;
        const isJobRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || (job.source || '').includes('himalayas') || jobLoc.includes('anywhere');
        if (workMode === 'remote') {
            matchesWorkMode = isJobRemote;
        } else if (workMode === 'onsite') {
            matchesWorkMode = !isJobRemote;
        }

        // 4. Match Score Filter
        const matchesScore = (job.match_score || 0) >= minScore;

        // 5. Source Platform Filter
        const matchesSource = source === 'all' || (job.source || '').toLowerCase().includes(source);

        // 6. Seniority Filter
        let matchesSeniority = true;
        const titleLower = (job.title || '').toLowerCase();
        const fitLower = (job.experience_fit || '').toLowerCase();
        const descLower = (job.description || '').toLowerCase();

        if (seniorityFilter === 'intern') {
            matchesSeniority = titleLower.includes('intern') || titleLower.includes('trainee') || fitLower.includes('intern') || titleLower.includes('graduate') || titleLower.includes('fresher') || descLower.includes('internship');
        } else if (seniorityFilter === 'junior') {
            matchesSeniority = titleLower.includes('junior') || titleLower.includes('jr') || titleLower.includes('entry') || titleLower.includes('associate') || fitLower.includes('junior');
        } else if (seniorityFilter === 'mid') {
            matchesSeniority = !titleLower.includes('senior') && !titleLower.includes('sr.') && !titleLower.includes('lead') && !titleLower.includes('principal') && !titleLower.includes('intern');
        } else if (seniorityFilter === 'senior') {
            matchesSeniority = titleLower.includes('senior') || titleLower.includes('sr.') || titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('staff') || titleLower.includes('head');
        }

        // 7. Date Filter
        let matchesDate = true;
        if (dateFilter === '24h') matchesDate = isWithinDays(job.posted_date, 1);
        else if (dateFilter === '3d') matchesDate = isWithinDays(job.posted_date, 3);
        else if (dateFilter === '7d') matchesDate = isWithinDays(job.posted_date, 7);
        else if (dateFilter === '30d') matchesDate = isWithinDays(job.posted_date, 30);

        return matchesKeyword && matchesLocSelect && matchesWorkMode && matchesScore && matchesSource && matchesSeniority && matchesDate;
    });

    // Track active filter chips for summary
    if (keyword) activeFilterLabels.push(`"${keyword}"`);
    if (locFilter !== 'all') activeFilterLabels.push(`📍 ${filterLocationSelect.options[filterLocationSelect.selectedIndex].text}`);
    if (workMode !== 'all') activeFilterLabels.push(workMode === 'remote' ? '🏠 Remote' : '🏢 Onsite');
    if (minScore > 0) activeFilterLabels.push(`⭐ ${minScore}%+`);
    if (seniorityFilter !== 'all') activeFilterLabels.push(`🎓 ${seniorityFilter.toUpperCase()}`);
    if (dateFilter !== 'all') activeFilterLabels.push(`📅 ${filterDate.options[filterDate.selectedIndex].text}`);
    if (source !== 'all') activeFilterLabels.push(`🌐 ${source}`);

    // Sorting
    if (sortMode === 'score') {
        filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    } else if (sortMode === 'date') {
        filtered.sort((a, b) => {
            const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
            const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
            return dateB - dateA;
        });
    } else if (sortMode === 'company') {
        filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    }

    renderJobs(filtered);

    const filterText = activeFilterLabels.length > 0 
        ? ` (Active Filters: ${activeFilterLabels.join(', ')})`
        : '';
    statsSummary.textContent = `Showing ${filtered.length} of ${allFetchedJobs.length} deduplicated jobs across platforms${filterText}`;
}

// Reset Filters Action
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        filterKeyword.value = '';
        if (filterLocationSelect) filterLocationSelect.value = 'all';
        if (filterWorkMode) filterWorkMode.value = 'all';
        filterDate.value = 'all';
        filterMinScore.value = '0';
        if (filterSeniority) filterSeniority.value = 'all';
        filterSource.value = 'all';
        sortBy.value = 'score';
        applyFilters();
    });
}

// Quick Suggestion Chips for RAG
suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const queryText = chip.getAttribute('data-query');
        if (queryText) {
            ragQueryInput.value = queryText;
            ragSendBtn.click();
        }
    });
});

// Event Listeners for Filters
filterKeyword.addEventListener('input', applyFilters);
if (filterLocationSelect) filterLocationSelect.addEventListener('change', applyFilters);
if (filterWorkMode) filterWorkMode.addEventListener('change', applyFilters);
filterDate.addEventListener('change', applyFilters);
filterMinScore.addEventListener('change', applyFilters);
if (filterSeniority) filterSeniority.addEventListener('change', applyFilters);
filterSource.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);

// RAG Question Handling
ragSendBtn.addEventListener('click', async () => {
    const question = ragQueryInput.value.trim();
    if (!question || !currentSearchId) return;

    ragSendBtn.disabled = true;
    ragSendBtn.textContent = 'Thinking...';
    ragResponseBox.classList.remove('hidden');
    ragResponseText.innerHTML = '<span style="color: var(--text-muted);">Analyzing matched jobs with Mistral AI...</span>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${currentSearchId}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: question,
                question: question 
            })
        });

        if (!response.ok) {
            throw new Error(`Query failed with status: ${response.status}`);
        }

        const data = await response.json();
        const rawAnswer = data.answer || "No response received.";
        
        let formatted = escapeHtml(rawAnswer)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>')
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline;">$1</a>');

        ragResponseText.innerHTML = formatted;
    } catch (err) {
        ragResponseText.innerHTML = `<span style="color: #ef4444;">Error querying jobs: ${escapeHtml(err.message)}</span>`;
    } finally {
        ragSendBtn.disabled = false;
        ragSendBtn.textContent = 'Ask AI';
    }
});

// CSV Export
exportCsvBtn.addEventListener('click', () => {
    if (!currentSearchId) return;
    window.location.href = `${API_BASE_URL}/api/v1/jobs/${currentSearchId}/export`;
});

// Helper Functions
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        btnText.textContent = 'Aggregating & Deduplicating...';
        btnSpinner.classList.remove('hidden');
    } else {
        btnText.textContent = '🚀 Run Intelligent Multi-Platform Search';
        btnSpinner.classList.add('hidden');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EMAIL ALERT AUTOMATION SYSTEM =====

// Scroll to alert section when button clicked
if (openAlertModalBtn) {
    openAlertModalBtn.addEventListener('click', () => {
        const alertSection = document.getElementById('alert-section');
        if (alertSection) alertSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// Save Daily Email Alert
if (alertForm) {
    alertForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('alert-email').value.trim();
        const role = document.getElementById('alert-role').value.trim();
        const location = document.getElementById('alert-location').value.trim();
        const time = document.getElementById('alert-time').value;
        const freshness = document.getElementById('alert-freshness').value;
        const workmode = document.getElementById('alert-workmode').value;

        if (!email || !role) {
            alert('Please provide at least your email and target role.');
            return;
        }

        saveAlertBtn.disabled = true;
        saveAlertBtn.textContent = '⏳ Saving Alert...';

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('role', role);
            formData.append('location', location || 'Remote');
            formData.append('experience_years', '0');
            formData.append('work_mode', workmode);
            formData.append('max_age_days', freshness);
            formData.append('preferred_time', time);

            const response = await fetch(`${API_BASE_URL}/api/v1/alerts`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                saveAlertBtn.textContent = '✅ Alert Saved!';
                setTimeout(() => { saveAlertBtn.textContent = '💾 Save Daily Email Automation'; saveAlertBtn.disabled = false; }, 2500);
                loadActiveAlerts();
            } else {
                alert(`Failed to save alert: ${data.detail || 'Unknown error'}`);
                saveAlertBtn.textContent = '💾 Save Daily Email Automation';
                saveAlertBtn.disabled = false;
            }
        } catch (err) {
            alert(`Error saving alert: ${err.message}`);
            saveAlertBtn.textContent = '💾 Save Daily Email Automation';
            saveAlertBtn.disabled = false;
        }
    });
}

// Send Test Email Now with exact inputs from form
if (sendTestEmailBtn) {
    sendTestEmailBtn.addEventListener('click', async () => {
        const email = document.getElementById('alert-email').value.trim();
        const role = document.getElementById('alert-role').value.trim();
        const location = document.getElementById('alert-location').value.trim();
        const freshness = document.getElementById('alert-freshness').value;
        const workmode = document.getElementById('alert-workmode').value;

        if (!email || !role) {
            alert('Please enter your email address and target role first.');
            return;
        }

        sendTestEmailBtn.disabled = true;
        sendTestEmailBtn.textContent = '⏳ Searching & Sending Email...';

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('role', role);
            formData.append('location', location || 'Remote');
            formData.append('work_mode', workmode);
            formData.append('max_age_days', freshness);
            formData.append('experience_years', '0');

            const response = await fetch(`${API_BASE_URL}/api/v1/alerts/test-send`, {
                method: 'POST',
                body: formData
            });

            let data;
            const resText = await response.text();
            try {
                data = JSON.parse(resText);
            } catch (jsonErr) {
                data = { detail: resText || `Server responded with status ${response.status}` };
            }

            if (response.ok && (data.status === 'success' || data.status === 'partial')) {
                sendTestEmailBtn.textContent = `✅ Sent ${data.jobs_sent || 0} Jobs + CSV to ${email}!`;
                setTimeout(() => { 
                    sendTestEmailBtn.textContent = '⚡ Send Live Test Email & CSV Now'; 
                    sendTestEmailBtn.disabled = false; 
                }, 5000);
            } else {
                alert(`Email dispatch issue: ${data.detail || data.message || resText || 'Unknown error'}`);
                sendTestEmailBtn.textContent = '⚡ Send Live Test Email & CSV Now';
                sendTestEmailBtn.disabled = false;
            }
        } catch (err) {
            alert(`Error sending test email: ${err.message}`);
            sendTestEmailBtn.textContent = '⚡ Send Live Test Email & CSV Now';
            sendTestEmailBtn.disabled = false;
        }
    });
}

// Load & Render Active Alerts
async function loadActiveAlerts() {
    if (!activeAlertsList) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/alerts`);
        const alerts = await response.json();

        if (!alerts || alerts.length === 0) {
            activeAlertsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No active email automations yet. Save one above to get started!</p>';
            return;
        }

        activeAlertsList.innerHTML = alerts.map(a => `
            <div class="alert-item" style="display: flex; align-items: center; justify-content: space-between; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 10px; padding: 12px 16px;">
                <div>
                    <strong style="color: #f8fafc; font-size: 0.9rem;">📧 ${escapeHtml(a.email)}</strong>
                    <span style="color: #94a3b8; font-size: 0.8rem; margin-left: 8px;">| ${escapeHtml(a.role)} | 📍 ${escapeHtml(a.location || 'Remote')} | ⏰ ${escapeHtml(a.preferred_time)} | 📅 ${a.max_age_days === 1 ? 'Past 24h' : (a.max_age_days === 0 ? 'All Dates' : `Past ${a.max_age_days || 1}d`)}</span>
                    ${a.last_sent_at ? `<span style="color: #10b981; font-size: 0.75rem; margin-left: 8px;">✅ Last sent: ${new Date(a.last_sent_at).toLocaleDateString()}</span>` : '<span style="color: #f59e0b; font-size: 0.75rem; margin-left: 8px;">⏳ Awaiting first dispatch</span>'}
                </div>
                <button onclick="deleteAlert('${a.id}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">✕ Remove</button>
            </div>
        `).join('');
    } catch (err) {
        activeAlertsList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Could not load alerts.</p>';
    }
}

// Delete an alert
async function deleteAlert(alertId) {
    if (!confirm('Are you sure you want to remove this email automation?')) return;
    try {
        await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, { method: 'DELETE' });
        loadActiveAlerts();
    } catch (err) {
        alert(`Error deleting alert: ${err.message}`);
    }
}

// Load alerts on page load
loadActiveAlerts();
