/**
 * World Clickers — API Client Helper
 * Shared across all pages for communicating with the backend.
 */

// ── Mock Backend Logic (Local Storage) ──────────────────────────

// Key constants for local storage
const STORAGE_KEYS = {
    SCORE: 'worldClickerScore',
    PLAYER_SCORE: 'worldClickerPlayerScore',
    TOOLS: 'worldClickerOwnedTools',
    REVEALED: 'worldClickerRevealedTools',
    NICKNAME: 'worldClickerNickname',
    COUNTRY_CODE: 'worldClickerCountryCode',
    COUNTRY_NAME: 'worldClickerCountryName',
    TOKEN: 'worldClickerToken',
    PLAYER_ID: 'worldClickerPlayerId'
};

async function apiGet(url) {
    console.log(`[MOCK API] GET ${url}`);

    if (url.startsWith('/players/') && url.endsWith('/score')) {
        const score = localStorage.getItem(STORAGE_KEYS.SCORE) || '0';
        const playerScore = localStorage.getItem(STORAGE_KEYS.PLAYER_SCORE) || '0';
        return { total_score: parseInt(score, 10), click_score: parseInt(playerScore, 10) };
    }

    if (url.startsWith('/players/') && url.endsWith('/tools')) {
        const toolsStr = localStorage.getItem(STORAGE_KEYS.TOOLS) || '{}';
        const toolsObj = JSON.parse(toolsStr);
        // Convert map to array format expected by profile/leaderboard
        const tools = Object.entries(toolsObj).map(([id, count]) => ({ id, count }));
        return { success: true, tools };
    }

    if (url === '/auth/me') {
        const nickname = localStorage.getItem(STORAGE_KEYS.NICKNAME);
        if (!nickname) return { error: 'Not logged in' };
        return {
            nickname,
            country_code: localStorage.getItem(STORAGE_KEYS.COUNTRY_CODE),
            country_name: localStorage.getItem(STORAGE_KEYS.COUNTRY_NAME)
        };
    }

    if (url === '/leaderboard/global') {
        // Return a dummy list or the player themselves as the only entry
        const nickname = localStorage.getItem(STORAGE_KEYS.NICKNAME) || 'Guest';
        const score = parseInt(localStorage.getItem(STORAGE_KEYS.SCORE) || '0', 10);
        return {
            global: [
                { nickname, total_score: score, country_code: localStorage.getItem(STORAGE_KEYS.COUNTRY_CODE) || 'US' }
            ]
        };
    }

    return { error: 'Not found' };
}

async function apiPost(url, body) {
    console.log(`[MOCK API] POST ${url}`, body);

    if (url === '/auth/set-nickname') {
        localStorage.setItem(STORAGE_KEYS.NICKNAME, body.nickname);
        if (body.country_code) localStorage.setItem(STORAGE_KEYS.COUNTRY_CODE, body.country_code);
        if (body.country_name) localStorage.setItem(STORAGE_KEYS.COUNTRY_NAME, body.country_name);

        // Return a mock token and ID
        localStorage.setItem(STORAGE_KEYS.TOKEN, 'local-token-' + Date.now());
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, '1');

        return { success: true, nickname: body.nickname, token: 'local-token' };
    }

    if (url === '/tools/buy') {
        const toolsStr = localStorage.getItem(STORAGE_KEYS.TOOLS) || '{}';
        const tools = JSON.parse(toolsStr);
        const amount = body.amount || 1;

        tools[body.tool_id] = (tools[body.tool_id] || 0) + amount;
        localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools));

        // Score deduction logic usually happens in script.js for guest, 
        // but let's return the new count.
        return { success: true, total_owned: tools[body.tool_id] };
    }

    if (url === '/players/sync-score') {
        // Just save to local storage
        if (body.total_score !== undefined) localStorage.setItem(STORAGE_KEYS.SCORE, body.total_score);
        if (body.click_score !== undefined) localStorage.setItem(STORAGE_KEYS.PLAYER_SCORE, body.click_score);
        return { success: true };
    }

    return { error: 'Not found' };
}

async function apiPut(url, body) {
    return { success: true };
}

// ── Player Session Management ───────────────────────────────────────

function getToken() {
    return localStorage.getItem('worldClickerToken');
}

function setToken(token) {
    if (token) {
        localStorage.setItem('worldClickerToken', token);
    } else {
        localStorage.removeItem('worldClickerToken');
    }
}

function getPlayerId() {
    return localStorage.getItem('worldClickerPlayerId');
}

function setPlayerId(id) {
    localStorage.setItem('worldClickerPlayerId', id.toString());
}

function getPlayerNickname() {
    return localStorage.getItem('worldClickerNickname');
}

function setPlayerNickname(name) {
    localStorage.setItem('worldClickerNickname', name);
}

function isLoggedIn() {
    return !!getToken() && !!getPlayerId();
}

// -- Responsive Text Display -----------------------------------------

/**
 * Dynamically scales the font size of an element down if its contents 
 * exceed a maximum available width provided by a callback.
 */
function makeScoreDynamic(elementId, maxAvailableWidthFn) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Save original font size as max
    const computedStyle = window.getComputedStyle(el);
    const maxFontSize = parseFloat(computedStyle.fontSize);

    const rescale = () => {
        // Reset to max
        el.style.fontSize = maxFontSize + 'px';

        let availableWidth = maxAvailableWidthFn();

        // Prevent negative or absurdly small bounds
        if (availableWidth < 50) availableWidth = 50;

        if (el.scrollWidth > availableWidth) {
            const scaleFactor = availableWidth / el.scrollWidth;
            let newFontSize = maxFontSize * scaleFactor;

            // Limit how small it can get so it remains readable
            if (newFontSize < 12) newFontSize = 12;

            el.style.fontSize = newFontSize + 'px';
        }
    };

    // Rescale on window resize
    window.addEventListener('resize', rescale);

    // Rescale whenever the text changes (using MutationObserver)
    const observer = new MutationObserver(() => {
        rescale();
    });

    // Watch character data or child list changes for text content updates
    observer.observe(el, { characterData: true, childList: true, subtree: true });

    // Initial scale
    rescale();
}

// -- Number Formatting -----------------------------------------------

window.formatShortNumber = function (num) {
    if (typeof num !== 'number') num = parseInt(num, 10);
    if (isNaN(num)) return '0';

    if (num < 1000) {
        return num.toLocaleString();
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg"];
    let suffixIndex = 0;
    let shortValue = num;

    while (shortValue >= 1000 && suffixIndex < suffixes.length - 1) {
        shortValue /= 1000;
        suffixIndex++;
    }

    // Use 1 decimal place as requested (e.g., 1.2K, 3.1M)
    let formatted = shortValue.toFixed(1);

    // If it's something like "1.0", convert to "1" to keep it clean
    if (formatted.endsWith('.0')) {
        formatted = shortValue.toFixed(0);
    }

    return formatted + `<span class="score-suffix">${suffixes[suffixIndex]}</span>`;
};
