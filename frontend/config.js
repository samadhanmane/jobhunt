/**
 * JobAgent AI - Frontend Runtime Configuration
 * 
 * When deploying to Vercel, you can set your Render backend URL here
 * or configure it directly on the Login screen in the browser.
 */
window.__APP_CONFIG__ = {
    VITE_BACKEND_URL: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? "http://localhost:8000"
        : ""
};
