/**
 * World Clicker - Main Game Logic
 */

// --- Configuration ---
const CONFIG = {
    clickRateLimitMs: 100, // 10 clicks per second max = 100ms interval
    resources: [
        { name: 'WOOD', rarity: 28, value: 1, img: 'resources/wood.png' },
        { name: 'FISH', rarity: 22, value: 2, img: 'resources/fish.png' },
        { name: 'COAL', rarity: 15, value: 4, img: 'resources/coal.png' },
        { name: 'STONE', rarity: 10, value: 5, img: 'resources/stone.png' },
        { name: 'OIL', rarity: 8, value: 10, img: 'resources/oil.png' },
        { name: 'IRON', rarity: 7, value: 15, img: 'resources/iron.png' },
        { name: 'COPPER', rarity: 5, value: 20, img: 'resources/copper.png' },
        { name: 'SILVER', rarity: 3, value: 40, img: 'resources/silver.png' },
        { name: 'GOLD', rarity: 1.5, value: 80, img: 'resources/gold.png' },
        { name: 'DIAMOND', rarity: 0.5, value: 150, img: 'resources/diamond.png' }
    ],
    moonResources: [
        { name: 'REGOLITH DUST', rarity: 35, value: 200, img: 'resources/regolith_dust.png' },
        { name: 'LUNAR GLASS', rarity: 25, value: 300, img: 'resources/lunar_glass.png' },
        { name: 'LUNAR ICE', rarity: 15, value: 450, img: 'resources/lunar_ice.png' },
        { name: 'LUNAR SAPPHIRE', rarity: 8, value: 700, img: 'resources/lunar_sapphire.png' },
        { name: 'ANCIENT METEOR ALLOY', rarity: 6, value: 1000, img: 'resources/ancient_meteor_alloy.png' },
        { name: 'QUANTUM FIBER', rarity: 4, value: 1500, img: 'resources/quantum_fiber.png' },
        { name: 'STARDUST CRYSTALS', rarity: 3, value: 2000, img: 'resources/stardust_crystals.png' },
        { name: 'MOONSTONE CORE', rarity: 2.5, value: 3000, img: 'resources/moonstone_core.png' },
        { name: 'DARK MATTER FRAGMENTS', rarity: 1.3, value: 4000, img: 'resources/dark_matter_fragments.png' },
        { name: 'ETHEREUM PULSE', rarity: 0.2, value: 5000, img: 'resources/ethereum_pulse.png' }
    ],
    earthTools: [
        { id: 't_wood', name: 'Timber Axe', price: 0.49, val: 1, res: 'Wood', img: 'tools/timber_axe.png' },
        { id: 't_fish', name: 'Hydro Netter', price: 0.79, val: 1, res: 'Fish', img: 'tools/hydro_netter.png' },
        { id: 't_coal', name: 'Coal Cracker', price: 1.29, val: 1, res: 'Coal', img: 'tools/coal_cracker.png' },
        { id: 't_stone', name: 'Stone Splitter', price: 1.59, val: 1, res: 'Stone', img: 'tools/stone_splitter.png' },
        { id: 't_oil', name: 'Oil Extractor', price: 2.49, val: 1, res: 'Oil', img: 'tools/oil_extractor.png' },
        { id: 't_iron', name: 'Iron Digger', price: 3.49, val: 1, res: 'Iron', img: 'tools/iron_digger.png' },
        { id: 't_copper', name: 'Copper Cutter', price: 4.49, val: 1, res: 'Copper', img: 'tools/copper_cutter.png' },
        { id: 't_silver', name: 'Silver Shaver', price: 6.49, val: 1, res: 'Silver', img: 'tools/silver_shaver.png' },
        { id: 't_gold', name: 'Gold Miner Rig', price: 8.99, val: 1, res: 'Gold', img: 'tools/gold_miner_rig.png' },
        { id: 't_diamond', name: 'Crystal Drill', price: 12.99, val: 1, res: 'Diamond', img: 'tools/crystal_pierce_drill.png' }
    ],
    moonTools: [
        { id: 'm_dust', name: 'Dust Vacuumer', price: 13.99, val: 1, res: 'Regolith Dust', img: 'tools/dust_vacuumer.png' },
        { id: 'm_glass', name: 'Glass Glow Cutter', price: 14.99, val: 1, res: 'Lunar Glass', img: 'tools/glass_glow_cutter.png' },
        { id: 'm_ice', name: 'Frost Core Drill', price: 15.99, val: 1, res: 'Lunar Ice', img: 'tools/frost_core_drill.png' },
        { id: 'm_sapphire', name: 'Sapphire Saw', price: 16.99, val: 1, res: 'Lunar Sapphire', img: 'tools/sapphire_saw.png' },
        { id: 'm_meteor', name: 'Meteor Forge', price: 17.99, val: 1, res: 'Meteor Alloy', img: 'tools/meteor_forge_extractor.png' },
        { id: 'm_fiber', name: 'Quantum Puller', price: 18.49, val: 1, res: 'Quantum Fiber', img: 'tools/quantum_thread_puller.png' },
        { id: 'm_shard', name: 'Star Shard Col.', price: 18.99, val: 1, res: 'Stardust', img: 'tools/star_shard_collector.png' },
        { id: 'm_core', name: 'Core Pulse Harv.', price: 19.49, val: 1, res: 'Moonstone', img: 'tools/core_pulse_harvester.png' },
        { id: 'm_void', name: 'Void Splitter', price: 19.79, val: 1, res: 'Dark Matter', img: 'tools/void_splitter.png' },
        { id: 'm_pulse', name: 'Pulse Conductor', price: 19.99, val: 1, res: 'Ether. Pulse', img: 'tools/pulse_conductor.png' }
    ]
};

// --- Country Detection ---
// Country code redirects (show different country's flag)
const COUNTRY_CODE_REDIRECTS = {
    'IL': 'PS' // Israel shows Palestine flag
};

// Country name overrides (for proper naming)
const COUNTRY_NAME_OVERRIDES = {
    'PS': 'Palestine', // Ensure Palestine is named correctly
    'IL': 'Palestine'  // Israel also shows as Palestine
};

// --- Preloaded Image Cache ---
// Stores fully-decoded Image objects keyed by src path so popup images render instantly
const imageCache = {};

// --- Game State ---
let state = {
    score: 0,
    playerScore: 0, // Individual player progress
    lastClickTime: 0,
    musicEnabled: true,
    audioEnabled: true,
    gameStarted: false,
    location: 'EARTH', // 'EARTH' or 'MOON'
    isTravelling: false,
    country: null // Player's country info { code, name }
};

// --- Server Sync State ---
let serverSync = {
    pendingClicks: 0,           // Clicks queued to send to server
    autoMinePerSecond: 0,       // Player's auto-mine value per second
    syncInterval: null,         // Click batch send interval
    tickInterval: null,         // 1-second score tick interval
    countryPollInterval: null   // Country score poll interval
};

// --- DOM Elements ---
// We use a getter or ensure this runs after DOM load via init, 
// but defining structure here is fine if looked up later.
// Actually, to be safe against nulls if this runs early, we'll keep the lookup object 
// but populate/use it inside init or just define it here assuming defer/bottom of body.
// The file is linked at bottom of body, so document.getElementById should work.
const dom = {
    scoreDisplay: document.getElementById('score-value'),
    playerScoreDisplay: document.getElementById('player-score-value'),
    playerIcon: document.querySelector('.player-icon'),

    // Systems
    earthSystem: document.getElementById('earth-system'),
    moonSystem: document.getElementById('moon-system'),

    // Interact Zones
    earthZone: document.getElementById('earth-interact-zone'),
    moonZone: document.getElementById('moon-interact-zone'),

    startOverlay: document.getElementById('start-overlay'),

    // Audio
    audioBg: document.getElementById('audio-bg-music'),
    audioClick: document.getElementById('audio-click'),
    audioPurchase: document.getElementById('audio-purchase'),

    // Top Right Buttons
    btnMusic: document.getElementById('btn-music'),
    btnAudio: document.getElementById('btn-audio'),
    btnHelp: document.getElementById('btn-help'),
    btnResources: document.getElementById('btn-resources'),
    btnAstronauts: document.getElementById('btn-astronauts'),
    btnShop: document.getElementById('btn-shop'),
    btnLeaderboard: document.getElementById('btn-leaderboard'),
    btnProfile: document.getElementById('btn-profile'),

    // Travel
    btnTravel: document.getElementById('btn-travel'),


    // Travel Confirmation Popup
    travelConfirmOverlay: document.getElementById('travel-confirm-overlay'),
    btnTravelClose: document.getElementById('btn-travel-close'),
    btnPayTravel: document.getElementById('btn-pay-travel'),

    // Country Flag
    countryFlag: document.getElementById('country-flag')
};

// --- Country Detection ---

// Process raw API data and apply redirects/overrides
function processCountryData(data) {
    if (data && data.country_code) {
        let countryCode = data.country_code;
        if (COUNTRY_CODE_REDIRECTS[countryCode]) {
            countryCode = COUNTRY_CODE_REDIRECTS[countryCode];
        }
        return {
            code: countryCode,
            name: COUNTRY_NAME_OVERRIDES[data.country_code] || data.country_name
        };
    }
    return null;
}

// Method 1: fetch (works online / HTTPS)
async function detectCountryFetch() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return processCountryData(data);
    } catch (error) {
        console.warn('Fetch country detection failed:', error);
        return null;
    }
}

// Method 2: JSONP (works from file:// — bypasses CORS)
function detectCountryJSONP() {
    return new Promise((resolve) => {
        const callbackName = '_ipapiCallback_' + Date.now();
        const timeout = setTimeout(() => {
            delete window[callbackName];
            resolve(null);
        }, 5000);

        window[callbackName] = function (data) {
            clearTimeout(timeout);
            delete window[callbackName];
            resolve(processCountryData(data));
        };

        const script = document.createElement('script');
        script.src = `https://ipapi.co/jsonp/?callback=${callbackName}`;
        script.onerror = () => {
            clearTimeout(timeout);
            delete window[callbackName];
            resolve(null);
        };
        document.body.appendChild(script);
    });
}

function displayFlag(countryCode) {
    if (dom.countryFlag && countryCode) {
        dom.countryFlag.src = `https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`;
        dom.countryFlag.style.display = 'block';
        dom.countryFlag.alt = `${state.country?.name || countryCode} Flag`;
        dom.countryFlag.onerror = () => { dom.countryFlag.style.display = 'none'; };
    }
}

function applyCountry(country) {
    state.country = country;
    displayFlag(country.code);
    localStorage.setItem('worldClickerCountryCode', country.code);
    localStorage.setItem('worldClickerCountryName', country.name);
    console.log(`Player country: ${country.name} (${country.code})`);
    // Immediately fetch country score once we know the country
    pollCountryScore();
}

async function initCountryFlag() {
    // If country is already set
    if (state.country && state.country.code) {
        displayFlag(state.country.code);
        return;
    }

    // 0. Check for authenticated user's country first
    const token = localStorage.getItem('worldClickerToken');
    if (token) {
        try {
            const user = await apiGet('/auth/me');
            if (user && user.country_code) {
                // User has a confirmed country, use it directly
                const country = { code: user.country_code, name: user.country_name || user.country_code };
                applyCountry(country);
                return;
            }
        } catch (e) {
            console.warn('Failed to fetch user country for index:', e);
        }
    }

    // 1. Try fetch API (ipapi.co)
    let country = await detectCountryFetch();
    if (country) { applyCountry(country); return; }

    // 2. Try JSONP (bypasses CORS for local file://)
    country = await detectCountryJSONP();
    if (country) { applyCountry(country); return; }

    // 3. Try alternative API (ip-api.com — different rate limits)
    try {
        const resp = await fetch('http://ip-api.com/json/?fields=countryCode,country');
        const data = await resp.json();
        if (data.countryCode) {
            country = processCountryData({ country_code: data.countryCode, country_name: data.country });
            if (country) { applyCountry(country); return; }
        }
    } catch (e) {
        console.warn('ip-api.com detection failed:', e);
    }

    // 4. Fallback: cached country from a previous detection
    const cachedCode = localStorage.getItem('worldClickerCountryCode');
    const cachedName = localStorage.getItem('worldClickerCountryName');
    if (cachedCode) {
        state.country = { code: cachedCode, name: cachedName || cachedCode };
        displayFlag(cachedCode);
        console.log(`Using cached country: ${cachedName} (${cachedCode})`);
    }
}

// --- Audio Init ---
function initAudio() {
    if (dom.audioBg && dom.audioBg.paused && state.musicEnabled) {
        dom.audioBg.volume = 1.0;
        dom.audioBg.play().catch(e => console.log("Audio autoplay blocked until interaction"));
    }
}

// --- Audio Features ---
function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    const icon = dom.btnMusic;
    const mobileIcon = document.getElementById('btn-mobile-music');

    if (state.musicEnabled) {
        if (dom.audioBg) {
            dom.audioBg.volume = 1.0;
            if (dom.audioBg.paused) dom.audioBg.play().catch(() => { });
        }
        if (icon) {
            icon.style.opacity = '1';
            icon.classList.remove('fa-music-slash');
            icon.classList.add('fa-music');
        }
        if (mobileIcon) mobileIcon.style.opacity = '1';
        localStorage.setItem('worldClickerMusic', 'true');
    } else {
        if (dom.audioBg) dom.audioBg.pause();
        if (icon) icon.style.opacity = '0.4'; // Dim to indicate off
        if (mobileIcon) mobileIcon.style.opacity = '0.4';
        localStorage.setItem('worldClickerMusic', 'false');
    }
}

function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    const icon = dom.btnAudio;
    const mobileIcon = document.getElementById('btn-mobile-audio');

    if (state.audioEnabled) {
        if (icon) icon.style.opacity = '1';
        if (mobileIcon) mobileIcon.style.opacity = '1';
        localStorage.setItem('worldClickerAudio', 'true');
    } else {
        if (icon) icon.style.opacity = '0.4'; // Matches Music Icon
        if (mobileIcon) mobileIcon.style.opacity = '0.4';
        localStorage.setItem('worldClickerAudio', 'false');
    }
}

// --- Menu Logic Removed ---
// --- Shop & Leaderboard (now standalone pages) ---
function openShop() {
    localStorage.setItem('worldClickerLocation', state.location);
    window.location.href = 'shop.html';
}

function openLeaderboard() {
    window.location.href = 'leaderboard.html';
}


// --- core Logic ---
function getRandomResource() {
    const rand = Math.random() * 100;
    let pool = CONFIG.resources;

    // Select pool based on location
    if (state.location === 'MOON') {
        pool = CONFIG.moonResources;
    }

    let cumulative = 0;
    for (const res of pool) {
        cumulative += res.rarity;
        if (rand < cumulative) {
            return res;
        }
    }
    return pool[0];
}

function spawnPopup(x, y, resource) {
    const popup = document.createElement('div');
    popup.className = 'resource-popup';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    // Use cached (already decoded) image to avoid visible loading
    const cached = imageCache[resource.img];
    const img = cached ? cached.cloneNode() : new Image();
    if (!cached) img.src = resource.img; // fallback: set src if somehow not cached
    img.alt = resource.name;

    const span = document.createElement('span');
    span.textContent = `+${resource.value}`;

    popup.appendChild(img);
    popup.appendChild(span);
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// --- Travel Logic ---
function updateTravelButton() {
    // No text to update - button is now a rocket image
}

function handleTravel() {
    if (state.isTravelling || !state.gameStarted) return;

    if (state.location === 'EARTH') {
        if (state.moonUnlocked) {
            // Country already unlocked the Moon! Fly directly.
            executeAnimation();
        } else {
            // Show confirmation popup to pay $100 when leaving Earth
            if (dom.travelConfirmOverlay) {
                dom.travelConfirmOverlay.classList.remove('hidden');
            }
        }
    } else {
        // Leaving Moon -> Going to Earth (no popup for now)
        executeAnimation();
    }
}

async function executeTravel() {
    if (state.isTravelling || !state.gameStarted) return;

    if (state.location === 'EARTH') {
        // Authenticate before travel
        const playerId = typeof getPlayerId === 'function' ? getPlayerId() : null;
        if (!playerId) {
            alert('Please login first to travel to the moon!');
            return;
        }

        // Sync pending clicks before checking score
        if (typeof sendClickBatch === 'function') {
            await sendClickBatch();
        }

        // Attempt to purchase ticket
        const result = await apiPost('/travel/moon', {});
        if (!result || result.error) {
            alert(result ? result.error : 'Failed to purchase ticket.');
            return;
        }

        // Locally deduct score for immediate UI feedback (if we were actually charged)
        if (!result.already_unlocked) {
            state.playerScore = Math.max(0, state.playerScore - 100);
            if (state.score >= 100) state.score -= 100;

            if (dom.playerScoreDisplay) dom.playerScoreDisplay.textContent = state.playerScore.toLocaleString();
            if (dom.scoreDisplay) dom.scoreDisplay.textContent = state.score.toLocaleString();

            localStorage.setItem('worldClickerPlayerScore', state.playerScore);
            localStorage.setItem('worldClickerScore', state.score);

            // Play purchase sound
            if (state.audioEnabled && dom.audioPurchase) {
                const sound = dom.audioPurchase.cloneNode();
                sound.volume = 0.5;
                sound.play().catch(() => { });
            }
        }

        // Mark as unlocked locally so subsequent clicks bypass this
        state.moonUnlocked = true;
    }

    executeAnimation();
}

function executeAnimation() {
    // Hide confirmation popup if visible
    if (dom.travelConfirmOverlay) {
        dom.travelConfirmOverlay.classList.add('hidden');
    }

    state.isTravelling = true;

    // Fade OUT button
    dom.btnTravel.classList.remove('visible');

    if (state.location === 'EARTH') {
        // Leaving Earth -> Going to Moon
        dom.earthSystem.classList.add('off-screen-left');
        dom.moonSystem.classList.remove('off-screen-right');
        state.location = 'MOON';
    } else {
        // Leaving Moon -> Going to Earth
        dom.moonSystem.classList.add('off-screen-right');
        dom.earthSystem.classList.remove('off-screen-left');
        state.location = 'EARTH';
    }

    // Text update moved to timeout to prevent visual jump before fade

    setTimeout(() => {
        state.isTravelling = false;

        updateTravelButton(); // Update text while hidden



        // Fade IN button
        dom.btnTravel.classList.add('visible');
    }, 1500);
}

// Track if touch event was recently handled to prevent synthetic mouse events
let lastTouchTime = 0;

function handleMine(e) {
    const now = Date.now();

    // Prevent synthetic mouse events after touch
    if (e.type === 'mousedown' || e.type === 'click') {
        // If a touch event happened within 500ms, ignore this mouse event
        // FIX: Allow if game hasn't started yet (we need 'click' to unlock audio)
        if (now - lastTouchTime < 500 && state.gameStarted) return;
    }

    // Track touch events
    if (e.type === 'touchstart') {
        lastTouchTime = now;
    }

    // Only allow Left Click (button 0) for mouse events
    if (e.type === 'mousedown' && e.button !== 0) return;

    // --- Start Game Logic ---
    if (!state.gameStarted) {
        // FIX: Ignore touchstart for game start. Wait for 'click' to unlock AudioContext.
        if (e.type === 'touchstart') return;

        state.gameStarted = true;
        dom.startOverlay.classList.add('hidden');
        dom.btnTravel.classList.add('visible'); // Show Travel Button
        initAudio();
        return;
    }

    // --- Mining Logic ---
    // Prevent interaction during travel
    if (state.isTravelling) return;

    // Rate Limit - prevent double clicks
    if (now - state.lastClickTime < CONFIG.clickRateLimitMs) return;

    state.lastClickTime = now;

    if (state.audioEnabled && dom.audioClick) {
        const sound = dom.audioClick.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(() => { });
    }

    const resource = getRandomResource();
    state.playerScore += resource.value; // Increment player score

    // Queue click value for server sync
    serverSync.pendingClicks += resource.value;

    // Only update player score display — country score is server-driven
    dom.playerScoreDisplay.textContent = state.playerScore.toLocaleString();

    // Get coordinates - handle both mouse and touch events
    let clientX, clientY;
    if (e.type === 'touchstart' && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // On mobile, offset popup above finger so it's not hidden
    if (e.type === 'touchstart') {
        clientY -= 80;
    }

    spawnPopup(clientX, clientY, resource);

    localStorage.setItem('worldClickerPlayerScore', state.playerScore);

    // Animation Pulse (Target dynamic system's wrapper)
    let systemEl;
    if (state.location === 'MOON') {
        systemEl = dom.moonSystem;
    } else {
        systemEl = dom.earthSystem;
    }

    // Find the wrapper
    const wrapper = systemEl.querySelector('.pulse-wrapper');
    if (wrapper) {
        // Clear separate timeout if exists to prevent fighting
        if (wrapper.pulseTimer) clearTimeout(wrapper.pulseTimer);

        wrapper.classList.remove('trigger-pulse');
        void wrapper.offsetWidth;
        wrapper.classList.add('trigger-pulse');

        wrapper.pulseTimer = setTimeout(() => {
            wrapper.classList.remove('trigger-pulse');
            wrapper.pulseTimer = null;
        }, 200);
    }
}

// --- Server Sync Functions ---

// Send accumulated clicks to server every 3 seconds
async function sendClickBatch() {
    if (serverSync.pendingClicks <= 0) return;
    const playerId = typeof getPlayerId === 'function' ? getPlayerId() : null;
    if (!playerId) return;

    const amount = serverSync.pendingClicks;
    serverSync.pendingClicks = 0; // Reset before async call

    const result = await apiPost('/clicks', { player_id: parseInt(playerId, 10), amount: amount });
    if (!result) {
        // If failed, add clicks back to pending
        serverSync.pendingClicks += amount;
    }
}

// Update displayed player score every 1 second (auto-mine tick)
function tickPlayerScore() {
    // Only update the player's own score from their auto-mine tools
    if (serverSync.autoMinePerSecond > 0) {
        state.playerScore += serverSync.autoMinePerSecond;
        dom.playerScoreDisplay.textContent = state.playerScore.toLocaleString();
        localStorage.setItem('worldClickerPlayerScore', state.playerScore);
    }
}

// Poll country score from server every 1 second (real-time endpoint)
async function pollCountryScore() {
    if (!state.country || !state.country.code) return;

    const data = await apiGet('/leaderboard/country/' + state.country.code);
    if (data) {
        const serverValue = data.total_score || 0;
        state.moonUnlocked = data.moon_unlocked === true;

        // Always use the server value — it's computed real-time now
        // But ensure country score is never less than player score
        // (in case of slight timing differences)
        const displayValue = Math.max(serverValue, state.playerScore);

        state.score = displayValue;
        if (dom.scoreDisplay) {
            dom.scoreDisplay.textContent = displayValue.toLocaleString();
        }
        localStorage.setItem('worldClickerScore', displayValue);
    }
}

// Load player score from server (on init)
async function loadPlayerFromServer() {
    const playerId = typeof getPlayerId === 'function' ? getPlayerId() : null;
    if (!playerId) return;

    const data = await apiGet('/players/' + playerId + '/score');
    if (data) {
        state.playerScore = data.total_score || 0;
        serverSync.autoMinePerSecond = data.auto_mine_per_second || 0;
        dom.playerScoreDisplay.textContent = state.playerScore.toLocaleString();
        localStorage.setItem('worldClickerPlayerScore', state.playerScore);
    }
}

// Start all sync intervals
function startServerSync() {
    // Send click batches every 3 seconds
    serverSync.syncInterval = setInterval(sendClickBatch, 3000);
    // Tick player score every 1 second (auto-mine)
    serverSync.tickInterval = setInterval(tickPlayerScore, 1000);
    // Poll country score every 1 second (server computes real-time)
    pollCountryScore();
    serverSync.countryPollInterval = setInterval(pollCountryScore, 1000);
}

// --- Initialization ---
function init() {
    // Load Score from localStorage first (instant display)
    const savedScore = localStorage.getItem('worldClickerScore');
    const savedPlayerScore = localStorage.getItem('worldClickerPlayerScore');

    if (savedScore) {
        state.score = parseInt(savedScore, 10) || 0;
        dom.scoreDisplay.textContent = state.score.toLocaleString();
    }

    if (savedPlayerScore) {
        state.playerScore = parseInt(savedPlayerScore, 10) || 0;
        dom.playerScoreDisplay.textContent = state.playerScore.toLocaleString();
    }

    // Then load real score from server (overrides localStorage)
    loadPlayerFromServer();

    // If we have a cached country code, set it immediately so the first poll works
    const cachedCode = localStorage.getItem('worldClickerCountryCode');
    const cachedName = localStorage.getItem('worldClickerCountryName');
    if (cachedCode && !state.country) {
        state.country = { code: cachedCode, name: cachedName || cachedCode };
    }

    // Start syncing with server
    startServerSync();

    // Load Audio Settings
    const savedMusic = localStorage.getItem('worldClickerMusic');
    if (savedMusic !== null) {
        state.musicEnabled = (savedMusic === 'true');
        // Update Icons
        const musicOpacity = state.musicEnabled ? '1' : '0.4';
        if (dom.btnMusic) dom.btnMusic.style.opacity = musicOpacity;
        const mobileMusic = document.getElementById('btn-mobile-music');
        if (mobileMusic) mobileMusic.style.opacity = musicOpacity;

        // If disabled, ensure logic knows (Music starts paused, so if enabled it plays on interation)
    }

    const savedAudio = localStorage.getItem('worldClickerAudio');
    if (savedAudio !== null) {
        state.audioEnabled = (savedAudio === 'true');
        const audioOpacity = state.audioEnabled ? '1' : '0.4';
        if (dom.btnAudio) dom.btnAudio.style.opacity = audioOpacity;
        const mobileAudio = document.getElementById('btn-mobile-audio');
        if (mobileAudio) mobileAudio.style.opacity = audioOpacity;
    }

    // Click Listeners (Desktop: mousedown, Mobile: touchstart)
    if (dom.earthZone) {
        dom.earthZone.addEventListener('mousedown', handleMine);
        dom.earthZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    if (dom.moonZone) {
        dom.moonZone.addEventListener('mousedown', handleMine);
        dom.moonZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    // Fix: Allow clicking the "PLAY" text/overlay to start the game
    if (dom.startOverlay) {
        dom.startOverlay.addEventListener('click', handleMine);
        dom.startOverlay.addEventListener('touchstart', handleMine, { passive: true });
    }

    // Travel
    if (dom.btnTravel) dom.btnTravel.addEventListener('click', handleTravel);

    // Travel Confirmation
    if (dom.btnPayTravel) dom.btnPayTravel.addEventListener('click', executeTravel);
    if (dom.btnTravelClose) dom.btnTravelClose.addEventListener('click', () => {
        if (dom.travelConfirmOverlay) dom.travelConfirmOverlay.classList.add('hidden');
    });

    // Audio
    if (dom.btnMusic) dom.btnMusic.addEventListener('click', toggleMusic);
    if (dom.btnAudio) dom.btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAudio();
    });

    // Help Button
    if (dom.btnHelp) dom.btnHelp.addEventListener('click', () => { window.location.href = 'info.html'; });



    // Resources Button
    if (dom.btnResources) dom.btnResources.addEventListener('click', () => { window.location.href = 'resources.html'; });

    // Bottom Buttons → Standalone Pages
    if (dom.btnShop) dom.btnShop.addEventListener('click', openShop);
    if (dom.btnLeaderboard) dom.btnLeaderboard.addEventListener('click', openLeaderboard);
    if (dom.btnAstronauts) dom.btnAstronauts.addEventListener('click', () => { window.location.href = 'astronauts.html'; });
    if (dom.btnProfile) dom.btnProfile.addEventListener('click', () => {
        const loggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
        if (loggedIn) {
            window.location.href = 'profile.html';
        } else {
            window.location.href = `login.html?score=${state.playerScore}`;
        }
    });

    // --- Mobile Menu Logic ---
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const btnMenu = document.getElementById('btn-menu');
    const btnMobileClose = document.getElementById('btn-mobile-close');

    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('hidden');
                // Small delay to allow display:flex to apply before opacity transition
                setTimeout(() => mobileMenuOverlay.classList.add('active'), 10);
            }
        });
    }

    if (btnMobileClose) {
        btnMobileClose.addEventListener('click', () => {
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('active');
                setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
            }
        });
    }

    // Mobile Menu Navigation
    if (document.getElementById('btn-mobile-resources')) {
        document.getElementById('btn-mobile-resources').addEventListener('click', () => { window.location.href = 'resources.html'; });
    }
    if (document.getElementById('btn-mobile-astronauts')) {
        document.getElementById('btn-mobile-astronauts').addEventListener('click', () => { window.location.href = 'astronauts.html'; });
    }
    if (document.getElementById('btn-mobile-shop')) {
        document.getElementById('btn-mobile-shop').addEventListener('click', openShop);
    }
    if (document.getElementById('btn-mobile-leaderboard')) {
        document.getElementById('btn-mobile-leaderboard').addEventListener('click', openLeaderboard);
    }

    // Mobile Footer Icons
    if (document.getElementById('btn-mobile-music')) {
        document.getElementById('btn-mobile-music').addEventListener('click', toggleMusic);
    }
    if (document.getElementById('btn-mobile-audio')) {
        document.getElementById('btn-mobile-audio').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAudio();
        });
    }
    if (document.getElementById('btn-mobile-help')) {
        document.getElementById('btn-mobile-help').addEventListener('click', () => { window.location.href = 'info.html'; });
    }

    document.addEventListener('dragstart', e => e.preventDefault());

    // Disable Right Click Menu
    document.addEventListener('contextmenu', e => e.preventDefault());
}

// --- Loading & Preload Logic ---
async function preloadAssets() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBar = document.getElementById('loading-bar-fill');

    // 1. Gather ALL image assets (space, UI, resources, tools, cursors)
    const imagePaths = [
        // Space / globe textures
        'space/background.jpg',
        'space/earth.jpg',
        'space/clouds.png',
        'space/earth_glow.png',
        'space/circular_shading.png',
        'space/moon.jpg',
        'space/moon_border.png',
        'space/moon_glow.png',
        'space/rocket.png',
        'space/space-clouds.png',
        // UI assets
        'favicon.png',
        'world_clickers_logo.png',
        // Cursors
        'cursor.png',
        'tools/dug_vacuumer.png'
    ];

    // Add Resources
    CONFIG.resources.forEach(r => imagePaths.push(r.img));
    CONFIG.moonResources.forEach(r => imagePaths.push(r.img));

    // Add Tools
    CONFIG.earthTools.forEach(t => imagePaths.push(t.img));
    CONFIG.moonTools.forEach(t => imagePaths.push(t.img));

    // Get DOM audio elements for preloading
    const domAudioElements = [
        document.getElementById('audio-bg-music'),
        document.getElementById('audio-click'),
        document.getElementById('audio-purchase')
    ].filter(el => el !== null);

    // Calculate total assets: images + audio elements + fonts
    const totalAssets = imagePaths.length + domAudioElements.length + 1; // +1 for fonts
    let loadedCount = 0;

    const updateProgress = () => {
        loadedCount++;
        const percent = Math.min((loadedCount / totalAssets) * 100, 100);
        if (loadingBar) loadingBar.style.width = `${percent}%`;
    };

    // 2. Load Images — keep each in imageCache so popups can reuse the decoded bitmap
    const imagePromises = imagePaths.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imageCache[src] = img;   // store decoded image
                updateProgress();
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                updateProgress(); // Count errors too to avoid hanging
                resolve();
            };
        });
    });

    // 3. Load Audio - Use the ACTUAL DOM audio elements
    // This ensures the game's audio elements are ready, not separate Audio objects
    const audioPromises = domAudioElements.map(audio => {
        return new Promise((resolve) => {
            // Check if already loaded
            if (audio.readyState >= 4) { // HAVE_ENOUGH_DATA
                updateProgress();
                resolve();
                return;
            }

            let resolved = false;
            const onReady = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                updateProgress();
                resolve();
            };

            const onError = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                console.warn(`Failed to load audio: ${audio.src}`);
                updateProgress();
                resolve();
            };

            const cleanup = () => {
                audio.removeEventListener('canplaythrough', onReady);
                audio.removeEventListener('error', onError);
            };

            audio.addEventListener('canplaythrough', onReady, { once: true });
            audio.addEventListener('error', onError, { once: true });

            // Trigger load on the DOM element
            audio.load();

            // Timeout fallback for strict browser policies (5 seconds max wait)
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    cleanup();
                    console.log(`Audio timeout reached for: ${audio.src}`);
                    updateProgress();
                    resolve();
                }
            }, 5000);
        });
    });

    // 4. Wait for Fonts
    const fontPromise = document.fonts.ready.then(() => {
        updateProgress();
    });

    // 5. Run All
    await Promise.all([...imagePromises, ...audioPromises, fontPromise]);

    // 6. Complete
    // Small buffer for UX
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.classList.add('hidden'); // or remove
                loadingOverlay.style.display = 'none'; // Ensure standard hiding

                // Initialize Game
                init();
                initCountryFlag(); // Detect and display country flag
            }, 500);
        } else {
            init();
            initCountryFlag(); // Detect and display country flag
        }
    }, 500);
}


// --- Custom Cursor Logic (Edge Fix) ---
(function () {
    // Only run on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        // High-performance positioning
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Uniform styling, no missing file conflicts
        cursor.style.backgroundImage = "url('cursor.png')";
        cursor.style.width = '32px';
        cursor.style.height = '32px';

        // Pointer state detection (enlarge on buttons)
        const isClickable = e.target.closest('i, button, a, .menu-item, .tab-btn') ||
            window.getComputedStyle(e.target).cursor === 'pointer';

        if (isClickable) {
            cursor.style.transform = "scale(1.1) translateZ(9999px)";
        } else {
            cursor.style.transform = "none translateZ(9999px)";
        }
    });

    // Handle window edge leaving gracefully without breaking internal edges
    document.addEventListener('mouseleave', () => cursor.style.display = 'none');
    document.addEventListener('mouseenter', () => cursor.style.display = 'block');
})();

// Run
window.addEventListener('DOMContentLoaded', preloadAssets);
