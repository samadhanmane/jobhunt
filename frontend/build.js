const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Read VITE_BACKEND_URL strictly from process.env (Vercel) or .env file (local)
let backendUrl = process.env.VITE_BACKEND_URL || '';

if (!backendUrl) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^\s*VITE_BACKEND_URL\s*=\s*(.*?)\s*$/m);
        if (match && match[1]) {
            backendUrl = match[1].replace(/['"]/g, '').trim();
        }
    }
}

// 2. Generate config.js with ONLY the .env variable
const configContent = `/**
 * Generated dynamically from .env / Vercel Environment Variables
 */
window.__APP_CONFIG__ = {
    VITE_BACKEND_URL: "${backendUrl}"
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent, 'utf8');
console.log(`✅ [Build] Injected VITE_BACKEND_URL from .env: "${backendUrl}" into config.js`);

// 3. Compile app.jsx to app.compiled.js
function fetchBabel(cb) {
    https.get('https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.4/babel.min.js', (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return https.get(res.headers.location, r => {
                let d = '';
                r.on('data', c => d += c);
                r.on('end', () => cb(d));
            });
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => cb(data));
    }).on('error', () => cb(null));
}

fetchBabel((babelCode) => {
    if (!babelCode) {
        console.log('⚡ Babel transform skipped.');
        return;
    }
    try {
        const vm = require('vm');
        const ctx = { window: {}, document: {}, console: console };
        vm.createContext(ctx);
        vm.runInContext(babelCode, ctx);
        const Babel = ctx.Babel || ctx.window.Babel;
        const srcPath = path.join(__dirname, 'app.jsx');
        const outPath = path.join(__dirname, 'app.compiled.js');
        if (fs.existsSync(srcPath)) {
            const code = fs.readFileSync(srcPath, 'utf8');
            const transformed = Babel.transform(code, { presets: ['react', 'env'] });
            fs.writeFileSync(outPath, transformed.code, 'utf8');
            console.log('✅ [Build] Compiled app.jsx -> app.compiled.js');
        }
    } catch (e) {
        console.error('Build warning:', e.message);
    }
});
