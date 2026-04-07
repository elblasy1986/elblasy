/**
 * World Clicker - Main Game Logic
 */

// --- Configuration ---
// All game settings, prices, and metadata are loaded from the external config.js file.
// If you want to change game balance, edit config.js.
const CONFIG = {
    ...GAME_CONFIG,
    // Add any internal-only logic config here if needed
};

// --- Achievement & Medal Data ---
const ACHIEVEMENT_NAMES = [
    "First Click", "Getting Started", "Small Fortune", "Big Numbers", "Rising Power", "Planet Breaker",
    "Interplanetary Wealth", "Galactic Miner", "Master of the System", "First Investment", "Builder", "Industrialist",
    "Empire Builder", "Mega Industrialist", "Global Domination", "Automation Begins", "Machine Age", "Factory World",
    "Industrial Boom", "Planetary Production", "Tool Collector", "Lunar Engineer", "Martian Engineer", "Jovian Engineer",
    "Saturnian Engineer", "Uranian Engineer", "Neptunian Engineer", "Feel the Heat", "Heat Master", "Overdrive",
    "Eternal Overdrive", "Inferno", "First Challenge", "Focused", "Challenger", "Relentless", "Elite Challenger",
    "Clicker", "Tap Master", "Finger of Steel", "Frequent Traveler", "Space Addict", "Dedicated Miner", "Committed Miner",
    "Seasoned Miner", "Veteran", "Resource Hoarder", "Resource Empire", "Big Spender", "Economic Master"
];

const ACHIEVEMENT_DESCS = [
    "Mine your first resource", "Reach $100K", "Reach $1M", "Reach $1B", "Reach $1T", "Reach $1Q",
    "Unlock the Moon", "Unlock 3 additional planets", "Unlock all planets", "Buy your first tool", "Own 5 tools", "Own 25 tools",
    "Own 100 tools", "Own 250 tools", "Own 500 tools", "Reach $500K / second auto mining rate", "Reach $500M / second auto mining rate", "Reach $500B / second auto mining rate",
    "Reach $500T / second auto mining rate", "Reach $500Q / second auto mining rate", "Own all Earth tools", "Own all Moon tools", "Own all Mars tools", "Own all Jupiter tools",
    "Own all Saturn tools", "Own all Uranus tools", "Own all Neptune tools", "Reach max multiplier once", "Reach max multiplier 20 times", "Max multiplier for 1 minute in row",
    "Stay at max multiplier for 5 minutes total", "Stay at max multiplier for 10 minutes total", "Complete a challenge", "Complete 5 challenges", "Complete 10 challenges", "Complete 25 challenges", "Complete 50 challenges",
    "Perform 1K clicks", "Perform 10K clicks", "Perform 100K clicks", "Travel between planets 25 times", "Travel between planets 100 times", "Play for 1 hour total", "Play for 2.5 hours total",
    "Play for 5 hours total", "Play for 10 hours total", "Mine 5K resources manually", "Mine 50K resources manually", "Spend $1Q total", "Spend $10Q total"
];

const MEDAL_DATA = [
    { name: "Stone Core", desc: "Unlock when any 5 achievements are unlocked!" },
    { name: "Bronze Star", desc: "Unlock when any 10 achievements are unlocked!" },
    { name: "Silver Radiant", desc: "Unlock when any 15 achievements are unlocked!" },
    { name: "Orbital Gold", desc: "Unlock when any 20 achievements are unlocked!" },
    { name: "Lunar Relic", desc: "Unlock when any 25 achievements are unlocked!" },
    { name: "Solar Crest", desc: "Unlock when any 30 achievements are unlocked!" },
    { name: "Nebula Core", desc: "Unlock when any 35 achievements are unlocked!" },
    { name: "Void Gate", desc: "Unlock when any 40 achievements are unlocked!" },
    { name: "Cosmic Bloom", desc: "Unlock when any 45 achievements are unlocked!" },
    { name: "Stellar Nexus", desc: "Unlock when all 50 achievements are unlocked!" }
];

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
    musicVolume: 50,
    soundVolume: 25,
    gameStarted: false,
    location: 'EARTH', // 'EARTH', 'MOON', 'MARS', 'JUPITER', 'SATURN'
    isTravelling: false,
    country: null, // Player's country info { code, name }
    playerMoonUnlocked: localStorage.getItem('worldClickerPlayerMoonUnlocked') === 'true',
    playerMarsUnlocked: localStorage.getItem('worldClickerPlayerMarsUnlocked') === 'true',
    playerJupiterUnlocked: localStorage.getItem('worldClickerPlayerJupiterUnlocked') === 'true',
    playerSaturnUnlocked: localStorage.getItem('worldClickerPlayerSaturnUnlocked') === 'true',
    playerUranusUnlocked: localStorage.getItem('worldClickerPlayerUranusUnlocked') === 'true',
    playerNeptuneUnlocked: localStorage.getItem('worldClickerPlayerNeptuneUnlocked') === 'true',
    unlockedResources: ['WOOD'], // Start with wood
    unlockedMoonResources: ['REGOLITH DUST'], 
    unlockedMarsResources: ['REDSTONE'],
    unlockedJupiterResources: ['GAS VAPOR'],
    unlockedSaturnResources: ['RING DUST'],
    unlockedUranusResources: ['CYAN VAPOR'],
    unlockedNeptuneResources: ['AZURE MIST'],
    ownedTools: {}, // Track quantities { tool_id: count }
    revealedTools: {}, // Track tools revealed (seen) by the player { tool_id: true }
    clickHeat: 0, // Track clicking speed (0 to 100)
    totalEarned: 0,
    totalSpent: 0,
    totalClicks: 0,
    timePlayedSeconds: 0,
    manualMultiplier: 1,
    timeAtTopHeat: 0,
    multiplierDecayAccumulator: 0,
    minedResourcesCount: {}, // Track total units mined per resource (manual or auto)
    
    // Challenge Stats
    challengesCompleted: 0,
    challengesFailed: 0,
    fastestChallengeTime: null,
    totalChallengeRewards: 0,

    // Achievement & Medal Trackers
    totalTravels: 0,
    totalManualMines: 0,
    maxHeatReachedCount: 0,
    totalMaxHeatTime: 0, // Total seconds at max heat
    currentMaxHeatRowStartTime: null, // For 1-min row logic
    atMaxMultiplier: false, // New helper to track first hitting MAX
    maxMultiplierReachedCount: 0,
    totalMaxMultiplierTime: 0,
    currentMaxMultiplierRowStartTime: null,
    achievementsUnlocked: {}, // { id: true }
    medalsUnlocked: {} // { id: true }
};

// --- Score Management ---
function saveLocalState() {
    if (isErasing) return; // Prevent saving during erasure process
    localStorage.setItem('worldClickerScore', state.score);
    localStorage.setItem('worldClickerPlayerScore', state.playerScore);
    localStorage.setItem('worldClickerOwnedTools', JSON.stringify(state.ownedTools));
    localStorage.setItem('worldClickerRevealedTools', JSON.stringify(state.revealedTools));
    localStorage.setItem('worldClickerTotalEarned', state.totalEarned);
    localStorage.setItem('worldClickerTotalSpent', state.totalSpent);
    localStorage.setItem('worldClickerTotalClicks', state.totalClicks);
    localStorage.setItem('worldClickerTimePlayed', state.timePlayedSeconds);
    localStorage.setItem('worldClickerPlayerMoonUnlocked', state.playerMoonUnlocked);
    localStorage.setItem('worldClickerPlayerMarsUnlocked', state.playerMarsUnlocked);
    localStorage.setItem('worldClickerPlayerJupiterUnlocked', state.playerJupiterUnlocked);
    localStorage.setItem('worldClickerPlayerSaturnUnlocked', state.playerSaturnUnlocked);
    localStorage.setItem('worldClickerPlayerUranusUnlocked', state.playerUranusUnlocked);
    localStorage.setItem('worldClickerPlayerNeptuneUnlocked', state.playerNeptuneUnlocked);
    localStorage.setItem('worldClickerMinedResourcesCount', JSON.stringify(state.minedResourcesCount));
    localStorage.setItem('worldClickerMaxMultiplierReachedCount', state.maxMultiplierReachedCount);
    localStorage.setItem('worldClickerTotalMaxMultiplierTime', state.totalMaxMultiplierTime);
    localStorage.setItem('worldClickerAchievementsUnlocked', JSON.stringify(state.achievementsUnlocked));
    
    // Save Challenge Stats
    localStorage.setItem('worldClickerChallengesCompleted', state.challengesCompleted);
    localStorage.setItem('worldClickerChallengesFailed', state.challengesFailed);
    localStorage.setItem('worldClickerFastestChallengeTime', state.fastestChallengeTime === null ? "" : state.fastestChallengeTime);
    localStorage.setItem('worldClickerTotalChallengeRewards', state.totalChallengeRewards);

    // Save Achievement Trackers
    localStorage.setItem('worldClickerTotalTravels', state.totalTravels);
    localStorage.setItem('worldClickerTotalManualMines', state.totalManualMines);
    localStorage.setItem('worldClickerMaxHeatReachedCount', state.maxHeatReachedCount);
    localStorage.setItem('worldClickerTotalMaxHeatTime', state.totalMaxHeatTime);
    localStorage.setItem('worldClickerAchievementsUnlocked', JSON.stringify(state.achievementsUnlocked));
    localStorage.setItem('worldClickerMedalsUnlocked', JSON.stringify(state.medalsUnlocked));
}

let autoMineInterval = null;
let isErasing = false;

// Stop saving in ALL open tabs of the game when any tab starts erasing
window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === 'worldClicker_erasing_signal') {
        isErasing = true;
        if (autoMineInterval) clearInterval(autoMineInterval);
        if (typeof challengeState !== 'undefined' && challengeState.tickInterval) {
            clearInterval(challengeState.tickInterval);
        }
    }
});

state.autoMinePower = 0;

// --- DOM Elements ---
// We use a getter or ensure this runs after DOM load via init, 
// but defining structure here is fine if looked up later.
// Actually, to be safe against nulls if this runs early, we'll keep the lookup object 
// but populate/use it inside init or just define it here assuming defer/bottom of body.
// The file is linked at bottom of body, so document.getElementById should work.
const dom = {
    playerScoreDisplay: document.getElementById('player-score-value'),

    // Systems
    earthSystem: document.getElementById('earth-system'),
    moonSystem: document.getElementById('moon-system'),
    marsSystem: document.getElementById('mars-system'),
    jupiterSystem: document.getElementById('jupiter-system'),
    saturnSystem: document.getElementById('saturn-system'),
    uranusSystem: document.getElementById('uranus-system'),
    neptuneSystem: document.getElementById('neptune-system'),

    // Interact Zones
    earthZone: document.getElementById('earth-interact-zone'),
    moonZone: document.getElementById('moon-interact-zone'),
    marsZone: document.getElementById('mars-interact-zone'),
    jupiterZone: document.getElementById('jupiter-interact-zone'),
    saturnZone: document.getElementById('saturn-interact-zone'),
    uranusZone: document.getElementById('uranus-interact-zone'),
    neptuneZone: document.getElementById('neptune-interact-zone'),

    // Audio
    audioBg: document.getElementById('audio-bg-music'),
    audioClick: document.getElementById('audio-click'),
    audioPurchase: document.getElementById('audio-purchase'),
    audioAward: document.getElementById('audio-award'),

    btnMusic: document.getElementById('btn-music'),
    btnAudio: document.getElementById('btn-audio'),
    btnProfile: document.getElementById('btn-profile'),

    // Travel
    btnTravel: document.getElementById('btn-travel'),

    // Planet Selection Popup
    planetSelectOverlay: document.getElementById('planet-select-overlay'),
    btnPlanetSelectClose: document.getElementById('btn-planet-select-close'),
    planetButtons: document.getElementById('planet-buttons'),

    // Country Flag
    countryFlag: document.getElementById('country-flag'),

    // Shop Lists (for dynamic display)
    shopListEarth: document.getElementById('shop-list-earth'),
    shopListMoon: document.getElementById('shop-list-moon'),
    shopListMars: document.getElementById('shop-list-mars'),
    shopListJupiter: document.getElementById('shop-list-jupiter'),
    shopListSaturn: document.getElementById('shop-list-saturn'),
    shopListUranus: document.getElementById('shop-list-uranus'),
    shopListNeptune: document.getElementById('shop-list-neptune'),

    // Heat Bar
    heatBarFill: document.getElementById('heat-bar-fill'),

    // New Loading/Play
    btnPlayGame: document.getElementById('btn-play-game'),
    loadingBarContainer: document.getElementById('loading-bar-container'),
    loadingOverlay: document.getElementById('loading-overlay'),
    multiplierValue: document.getElementById('multiplier-value'),
    multiplierStatus: document.getElementById('multiplier-status-line'),
    multiplierStatusText: document.getElementById('multiplier-status-text'),
    multiplierBarContainer: document.getElementById('multiplier-bar-container'),
    multiplierBarFill: document.getElementById('multiplier-bar-fill'),

    // Unlock Notification
    unlockNotification: document.getElementById('unlock-notification'),
    topNavIcons: document.getElementById('top-nav-icons'),
    btnAwards: document.getElementById('btn-awards'),
    multiplierBarLeft: document.getElementById('multiplier-bar-left'),
    multiplierBarRight: document.getElementById('multiplier-bar-right'),
    loadingFavicon: document.querySelector('.loading-favicon'),
    challengePrefix: document.getElementById('challenge-prefix'),

    // Achievements
    btnAwards: document.getElementById('btn-awards'),
    achievementsOverlay: document.getElementById('achievements-overlay'),
    btnAchievementsClose: document.getElementById('btn-achievements-close'),
    achievementsGrid: document.getElementById('achievements-grid'),
    achievementsGridContainer: document.getElementById('achievements-grid-container')
};

/**
 * Replays the scale-up animation on the multiplier value.
 */
function triggerMultiplierPop() {
    if (!dom.multiplierValue) return;
    dom.multiplierValue.classList.remove('multiplier-pop-trigger');
    void dom.multiplierValue.offsetWidth; // Force reflow
    dom.multiplierValue.classList.add('multiplier-pop-trigger');
}

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

function initAudio() {
    // Restore saved volumes
    const savedMusicVol = localStorage.getItem('worldClickerMusicVolume');
    const savedSoundVol = localStorage.getItem('worldClickerSoundVolume');

    if (savedMusicVol !== null) state.musicVolume = parseInt(savedMusicVol, 10);
    if (savedSoundVol !== null) state.soundVolume = parseInt(savedSoundVol, 10);

    state.musicEnabled = state.musicVolume > 0;
    state.audioEnabled = state.soundVolume > 0;

    if (dom.audioBg) {
        dom.audioBg.volume = state.musicVolume / 100;
        if (!dom.audioBg.paused) return;
        if (state.musicEnabled) {
            dom.audioBg.play().catch(e => console.log("Audio autoplay blocked until interaction"));
        }
    }
}

// --- Stats Popup ---
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function updateGeneralStats() {
    const elTime = document.getElementById('stat-time-played');
    const elEarned = document.getElementById('stat-total-earned');
    const elSpent = document.getElementById('stat-total-spent');
    const elClicks = document.getElementById('stat-total-clicks');
    const elAutoRate = document.getElementById('stat-auto-rate');
    const elChallengesCompleted = document.getElementById('stat-challenges-completed');
    const elChallengesFailed = document.getElementById('stat-challenges-failed');
    const elChallengesSuccessRate = document.getElementById('stat-challenges-success-rate');
    const elChallengesFastestTime = document.getElementById('stat-challenges-fastest-time');
    const elChallengesTotalRewards = document.getElementById('stat-challenges-total-rewards');

    if (elTime) elTime.textContent = formatTime(state.timePlayedSeconds);
    if (elEarned) elEarned.innerHTML = '$' + window.formatShortNumber(state.totalEarned);
    if (elSpent) elSpent.innerHTML = '$' + window.formatShortNumber(state.totalSpent);
    if (elClicks) elClicks.textContent = state.totalClicks.toLocaleString();
    if (elAutoRate) elAutoRate.innerHTML = '$' + (window.formatShortNumber ? window.formatShortNumber(calculateAutoMinePower()) : calculateAutoMinePower()) + ' / second';
    
    if (elChallengesCompleted) elChallengesCompleted.textContent = state.challengesCompleted.toLocaleString();
    if (elChallengesFailed) elChallengesFailed.textContent = state.challengesFailed.toLocaleString();
    
    if (elChallengesSuccessRate) {
        const totalAttempts = state.challengesCompleted + state.challengesFailed;
        const successRate = totalAttempts > 0 ? ((state.challengesCompleted / totalAttempts) * 100).toFixed(1) : 0;
        elChallengesSuccessRate.textContent = successRate + '%';
    }
    
    if (elChallengesFastestTime) {
        elChallengesFastestTime.textContent = state.fastestChallengeTime !== null ? state.fastestChallengeTime.toFixed(1) + 's' : 'N/A';
    }
    
    if (elChallengesTotalRewards) {
        elChallengesTotalRewards.innerHTML = '$' + window.formatShortNumber(state.totalChallengeRewards);
    }
    
    // Space Travels Update
    const elTravels = document.getElementById('stat-space-travels');
    if (elTravels) elTravels.textContent = (state.totalTravels || 0).toLocaleString();
}

function updateResourcesStats() {
    const gridResources = document.getElementById('stats-resources-grid');
    if (gridResources) {
        gridResources.innerHTML = '';
        const allResources = [
            ...CONFIG.resources, 
            ...CONFIG.moonResources, 
            ...CONFIG.marsResources, 
            ...CONFIG.jupiterResources,
            ...CONFIG.saturnResources,
            ...CONFIG.uranusResources,
            ...CONFIG.neptuneResources
        ];
        
        allResources.forEach(res => {
            const item = document.createElement('div');
            item.className = 'stats-grid-item';
            
            const count = state.minedResourcesCount[res.name] || 0;
            // Logic for revealed
            const isEarth = CONFIG.resources.some(r => r.name === res.name);
            let isPlanetUnlocked = isEarth;
            if (CONFIG.moonResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerMoonUnlocked;
            if (CONFIG.marsResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerMarsUnlocked;
            if (CONFIG.jupiterResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerJupiterUnlocked;
            if (CONFIG.saturnResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerSaturnUnlocked;
            if (CONFIG.uranusResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerUranusUnlocked;
            if (CONFIG.neptuneResources.some(r => r.name === res.name)) isPlanetUnlocked = state.playerNeptuneUnlocked;

            const isRevealed = count > 0 || isPlanetUnlocked;

            if (isRevealed) {
                item.innerHTML = `
                    <img src="${res.img}" alt="${res.name}" class="stats-item-img">
                    <div class="stats-item-name">${res.name}</div>
                    <div class="stats-item-count">× ${window.formatShortNumber(count)}</div>
                `;
            } else {
                item.classList.add('stats-item-locked');
                item.innerHTML = `
                    <img src="${res.img}" alt="????" class="stats-item-img" style="filter: brightness(0);">
                    <div class="stats-item-name">????</div>
                    <div class="stats-item-count">× 0</div>
                `;
            }
            gridResources.appendChild(item);
        });
    }
    // Sync custom scrollbar
    initCustomStatsScrollbar('stats-resources-grid-container');
}

function updateToolsStats() {
    const gridTools = document.getElementById('stats-tools-grid');
    if (gridTools) {
        gridTools.innerHTML = '';
        const allTools = [
            ...CONFIG.earthTools, 
            ...CONFIG.moonTools, 
            ...CONFIG.marsTools,
            ...CONFIG.jupiterTools,
            ...CONFIG.saturnTools,
            ...CONFIG.uranusTools,
            ...CONFIG.neptuneTools
        ];

        allTools.forEach(tool => {
            const item = document.createElement('div');
            item.className = 'stats-grid-item';
            
            const owned = state.ownedTools[tool.id] || 0;
            const isRevealed = owned > 0 || state.revealedTools[tool.id];

            if (isRevealed) {
                item.innerHTML = `
                    <img src="${tool.img}" alt="${tool.name}" class="stats-item-img">
                    <div class="stats-item-name">${tool.name}</div>
                    <div class="stats-item-count">× ${window.formatShortNumber(owned)}</div>
                `;
            } else {
                item.classList.add('stats-item-locked');
                item.innerHTML = `
                    <img src="${tool.img}" alt="????" class="stats-item-img" style="filter: brightness(0);">
                    <div class="stats-item-name">????</div>
                    <div class="stats-item-count">× 0</div>
                `;
            }
            gridTools.appendChild(item);
        });
    }

    // Sync custom scrollbar
    initCustomStatsScrollbar('stats-tools-grid-container');
}

// --- Custom Statistics Scrollbar Logic (The Hard Way) ---
function initCustomScrollbar(containerId, direction = 'vertical') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    const isHorizontal = direction === 'horizontal';
    const trackClass = isHorizontal ? 'awards-custom-track' : 'stats-custom-track';
    const thumbClass = isHorizontal ? 'awards-custom-thumb' : 'stats-custom-thumb';

    // Remove old tracks to avoid duplicates
    const oldTracks = parent.querySelectorAll(`.${trackClass}`);
    oldTracks.forEach(t => t.remove());

    // Disconnect previous observer if it exists
    if (container._customScrollObserver) {
        container._customScrollObserver.disconnect();
    }

    const track = document.createElement('div');
    track.className = trackClass;
    const thumb = document.createElement('div');
    thumb.className = thumbClass;
    track.appendChild(thumb);
    parent.appendChild(track);

    // Initial Scroll Position
    if (isHorizontal) container.scrollLeft = 0;
    else container.scrollTop = 0;

    const updateThumb = () => {
        if (!track.parentElement) return; // Safety check

        const clientSize = isHorizontal ? container.clientWidth : container.clientHeight;
        const scrollSize = isHorizontal ? container.scrollWidth : container.scrollHeight;
        const scrollPos = isHorizontal ? container.scrollLeft : container.scrollTop;
        
        if (scrollSize <= clientSize + 2) {
            track.style.display = 'none';
            return;
        }
        track.style.display = 'block';

        const trackSize = isHorizontal ? track.clientWidth : track.clientHeight;
        const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
        const thumbSizeFixed = 80 * scale;
        
        const maxScroll = scrollSize - clientSize;
        const scrollPercent = Math.min(1, Math.max(0, scrollPos / maxScroll));
        const maxThumbTravel = trackSize - thumbSizeFixed;
        
        if (isHorizontal) {
            thumb.style.width = thumbSizeFixed + 'px';
            thumb.style.left = (scrollPercent * maxThumbTravel) + 'px';
        } else {
            thumb.style.height = thumbSizeFixed + 'px';
            thumb.style.top = (scrollPercent * maxThumbTravel) + 'px';
        }
    };

    // Use onscroll for easy overwriting in single-owner scenario
    container.onscroll = updateThumb;

    // Add Mouse Wheel Support for horizontal scrolling
    if (isHorizontal) {
        container.onwheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                container.scrollBy({
                    left: e.deltaY * 2.4, // Increased further to 2.4 for rapid navigation
                    behavior: 'smooth'
                });
            }
        };
    }

    let isDragging = false;
    let startPos, startScroll;

    const onMouseDown = (e) => {
        isDragging = true;
        thumb.classList.add('active');
        startPos = isHorizontal ? e.pageX : e.pageY;
        startScroll = isHorizontal ? container.scrollLeft : container.scrollTop;
        
        document.body.classList.add('dragging-scrollbar');
        e.preventDefault();
        e.stopPropagation();
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const currentPos = isHorizontal ? e.pageX : e.pageY;
        const delta = currentPos - startPos;
        
        const clientSize = isHorizontal ? container.clientWidth : container.clientHeight;
        const scrollSize = isHorizontal ? container.scrollWidth : container.scrollHeight;
        const trackSize = isHorizontal ? track.clientWidth : track.clientHeight;
        
        const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
        const thumbSizeFixed = 80 * scale;

        const maxThumbTravel = trackSize - thumbSizeFixed;
        const maxScroll = scrollSize - clientSize;
        
        const scrollRatio = delta / maxThumbTravel;
        
        if (isHorizontal) {
            container.scrollLeft = startScroll + (scrollRatio * maxScroll);
        } else {
            container.scrollTop = startScroll + (scrollRatio * maxScroll);
        }
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        thumb.classList.remove('active');
        document.body.classList.remove('dragging-scrollbar');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    // Use onmousedown for easy overwriting
    thumb.onmousedown = onMouseDown;

    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(container);
    const grid = container.firstElementChild;
    if (grid) resizeObserver.observe(grid);
    
    container._customScrollObserver = resizeObserver;

    setTimeout(updateThumb, 50); 
}

function openStatsTab(tabName) {
    const allTabs = document.querySelectorAll('.stats-tab-content');
    const allBtns = document.querySelectorAll('.stats-tab-btn');
    
    allTabs.forEach(t => t.classList.add('hidden'));
    allBtns.forEach(b => b.classList.remove('active'));

    const activeTab = document.getElementById(`stats-tab-${tabName}`);
    const activeBtn = document.getElementById(`btn-stats-tab-${tabName}`);

    if (activeTab) activeTab.classList.remove('hidden');
    if (activeBtn) activeBtn.classList.add('active');

    // Re-initialize custom scrollbar when tab is shown to restore position
    if (tabName === 'resources') {
        initCustomScrollbar('stats-resources-grid-container', 'vertical');
    } else if (tabName === 'tools') {
        initCustomScrollbar('stats-tools-grid-container', 'vertical');
    }

    // Populate data based on tab
    if (tabName === 'general') updateGeneralStats();
    if (tabName === 'resources') updateResourcesStats();
    if (tabName === 'tools') updateToolsStats();
    
    // Always load tabs from the top
    const resourceContainer = document.getElementById('stats-resources-grid-container');
    const toolsContainer = document.getElementById('stats-tools-grid-container');
    if (resourceContainer) resourceContainer.scrollTop = 0;
    if (toolsContainer) toolsContainer.scrollTop = 0;
}

/**
 * Initializes the Achievements grid with 50 achievement icons and random text.
 * All items are visible for now as requested.
 */
function initAchievementsGrid() {
    if (!dom.achievementsGrid) return;

    dom.achievementsGrid.innerHTML = '';
    
    for (let i = 1; i <= 50; i++) {
        const item = document.createElement('div');
        item.className = 'achievement-grid-item';
        
        const imgName = i.toString().padStart(2, '0') + '.png';
        const name = ACHIEVEMENT_NAMES[i-1] || `Achievement ${i}`;
        const desc = ACHIEVEMENT_DESCS[i-1] || `Description for achievement ${i}`;
        
        const isUnlocked = state.achievementsUnlocked && state.achievementsUnlocked[i];
        const lockedClass = isUnlocked ? '' : 'locked-achievement-img';

        item.innerHTML = `
            <img src="achievements/${imgName}" class="achievement-item-img ${lockedClass}" alt="${name}">
            <div class="achievement-item-name">${name}</div>
            <div class="achievement-item-desc">${desc}</div>
        `;
        
        dom.achievementsGrid.appendChild(item);
    }
}

/**
 * Initializes the Award System grid with 10 medals.
 */
function initAwardsGrid() {
    const awardsGrid = document.getElementById('awards-grid');
    if (!awardsGrid) return;

    awardsGrid.innerHTML = '';
    
    MEDAL_DATA.forEach((award, index) => {
        const item = document.createElement('div');
        const id = index + 1;
        const isUnlocked = state.medalsUnlocked && state.medalsUnlocked[id];
        
        item.className = isUnlocked ? 'medal-grid-item' : 'medal-grid-item locked'; 
        
        const imgNum = (index + 1).toString().padStart(2, '0');
        const imgPath = `medals/${imgNum}.png`;
        const lockedClass = isUnlocked ? '' : 'locked-achievement-img';
        const lockOverlay = isUnlocked ? '' : '<div class="medal-lock-overlay"><i class="fa-solid fa-lock"></i></div>';

        item.innerHTML = `
            <div class="medal-img-wrapper">
                <img src="${imgPath}" class="achievement-item-img ${lockedClass}" alt="${award.name}">
                ${lockOverlay}
            </div>
            <div class="medal-item-name">${award.name}</div>
            <div class="achievement-item-desc">${award.desc}</div>
        `;
        
        awardsGrid.appendChild(item);
    });
}



function openStats() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    openStatsTab('general');
}

function closeStats() {
    const overlay = document.getElementById('stats-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- Info Popup ---
function openInfo() {
    const overlay = document.getElementById('info-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeInfo() {
    const overlay = document.getElementById('info-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- Settings Popup ---
function openSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;

    // Sync slider values with current state
    const musicSlider = document.getElementById('slider-music');
    const soundSlider = document.getElementById('slider-sound');
    if (musicSlider) musicSlider.value = state.musicVolume;
    if (soundSlider) soundSlider.value = state.soundVolume;

    updateSettingsIcons();

    // Reset erase button
    const eraseBtn = document.getElementById('btn-erase-cache');
    if (eraseBtn) {
        eraseBtn.classList.remove('confirm');
        eraseBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Erase All Data!';
    }

    overlay.classList.remove('hidden');
}

function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function updateSettingsIcons() {
    const musicIcon = document.getElementById('settings-music-icon');
    const soundIcon = document.getElementById('settings-sound-icon');
    if (musicIcon) musicIcon.classList.toggle('muted', state.musicVolume === 0);
    if (soundIcon) soundIcon.classList.toggle('muted', state.soundVolume === 0);
}

function handleMusicSlider(e) {
    state.musicVolume = parseInt(e.target.value, 10);
    state.musicEnabled = state.musicVolume > 0;
    localStorage.setItem('worldClickerMusicVolume', state.musicVolume);
    localStorage.setItem('worldClickerMusic', state.musicEnabled ? 'true' : 'false');

    if (dom.audioBg) {
        dom.audioBg.volume = state.musicVolume / 100;
        if (state.musicEnabled && dom.audioBg.paused) {
            dom.audioBg.play().catch(() => {});
        } else if (!state.musicEnabled) {
            dom.audioBg.pause();
        }
    }
    updateSettingsIcons();
}

function handleSoundSlider(e) {
    state.soundVolume = parseInt(e.target.value, 10);
    state.audioEnabled = state.soundVolume > 0;
    localStorage.setItem('worldClickerSoundVolume', state.soundVolume);
    localStorage.setItem('worldClickerAudio', state.audioEnabled ? 'true' : 'false');
    updateSettingsIcons();
}

function handleEraseCache() {
    const eraseBtn = document.getElementById('btn-erase-cache');
    if (!eraseBtn) return;

    if (!eraseBtn.classList.contains('confirm')) {
        // First click: show confirmation
        eraseBtn.classList.add('confirm');
        eraseBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Click again to confirm!';
        return;
    }

    // Second click: erase everything
    isErasing = true; // Lock saving in this tab

    // Broadcast signal to other open tabs
    localStorage.setItem('worldClicker_erasing_signal', Date.now().toString());

    // Small delay to allow other tabs to capture the signal and stop saving
    setTimeout(() => {
        if (autoMineInterval) clearInterval(autoMineInterval);
        if (challengeState && challengeState.tickInterval) clearInterval(challengeState.tickInterval);

        // 1. Clear Local Storage (Game data)
        localStorage.clear();

        // 2. Clear Session Storage
        sessionStorage.clear();

        // 3. Clear all Cookies for this domain
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }

        // 4. Force hard reload from server
        location.reload();
    }, 50);
}



// --- Core Logic ---
// Returns the resource corresponding to the current heat bar level.
// The heat bar (0-100) is divided into 10 equal zones, each mapped to a resource.
// Zone 0 (0-10%): first resource (Wood / Regolith Dust)
// Zone 9 (90-100%): last resource (Diamond / Ethereum Pulse)
function getResourcePool() {
    if (state.location === 'NEPTUNE') return CONFIG.neptuneResources;
    if (state.location === 'URANUS') return CONFIG.uranusResources;
    if (state.location === 'SATURN') return CONFIG.saturnResources;
    if (state.location === 'JUPITER') return CONFIG.jupiterResources;
    if (state.location === 'MARS') return CONFIG.marsResources;
    if (state.location === 'MOON') return CONFIG.moonResources;
    return CONFIG.resources;
}

function getToolsForLocation(loc) {
    if (loc === 'NEPTUNE') return CONFIG.neptuneTools;
    if (loc === 'URANUS') return CONFIG.uranusTools;
    if (loc === 'SATURN') return CONFIG.saturnTools;
    if (loc === 'JUPITER') return CONFIG.jupiterTools;
    if (loc === 'MARS') return CONFIG.marsTools;
    if (loc === 'MOON') return CONFIG.moonTools;
    return CONFIG.earthTools;
}

function getHeatResource() {
    const pool = getResourcePool();

    let zone = Math.floor(state.clickHeat / 10);
    if (zone >= pool.length) zone = pool.length - 1;
    if (zone < 0) zone = 0;

    return pool[zone];
}

function spawnPopup(x, y, resource) {
    const popup = document.createElement('div');
    popup.className = 'resource-popup';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    // Use cached (already decoded) image to avoid visible loading
    const cached = imageCache[resource.img];
    const img = cached ? cached.cloneNode() : new Image();
    if (!cached) img.src = resource.img;
    img.alt = resource.name;

    const span = document.createElement('span');
    span.innerHTML = `+${window.formatShortNumber(resource.value)}`;

    popup.appendChild(img);
    popup.appendChild(span);
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

function spawnBuyPopup(e, toolName) {
    const popup = document.createElement('div');
    popup.className = 'resource-popup';

    const span = document.createElement('span');
    span.textContent = '+1';

    popup.appendChild(span);
    document.body.appendChild(popup);

    let x = e.clientX;
    let y = e.clientY;

    if (window.matchMedia('(pointer: coarse)').matches) {
        y -= 40;
    }

    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    setTimeout(() => {
        if (popup && popup.parentElement) {
            popup.remove();
        }
    }, 1000);
}

// --- Shop Logic ---
// Get the current price of a tool based on how many the player owns
function getToolCurrentPrice(tool) {
    const owned = state.ownedTools[tool.id] || 0;
    return Math.floor(tool.price * Math.pow(CONFIG.priceMultiplier, owned));
}

function renderShopList(tools, listId) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '';
    const playerId = typeof getPlayerId === 'function' ? getPlayerId() : null;

    tools.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'shop-item';

        const owned = state.ownedTools[tool.id] || 0;
        const ownedSuffix = owned > 0 ? ` × ${owned}` : '';
        const currentPrice = getToolCurrentPrice(tool);

        const isEarthTool = CONFIG.earthTools.some(t => t.id === tool.id);
        const isMoonTool = CONFIG.moonTools.some(t => t.id === tool.id);
        const isMarsTool = CONFIG.marsTools.some(t => t.id === tool.id);
        const isJupiterTool = CONFIG.jupiterTools.some(t => t.id === tool.id);
        const isSaturnTool = CONFIG.saturnTools.some(t => t.id === tool.id);
        const isUranusTool = CONFIG.uranusTools.some(t => t.id === tool.id);
        const isNeptuneTool = CONFIG.neptuneTools.some(t => t.id === tool.id);
        let index, resourceObj;
        if (isEarthTool) {
            index = CONFIG.earthTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.resources[index];
        } else if (isMoonTool) {
            index = CONFIG.moonTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.moonResources[index];
        } else if (isMarsTool) {
            index = CONFIG.marsTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.marsResources[index];
        } else if (isJupiterTool) {
            index = CONFIG.jupiterTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.jupiterResources[index];
        } else if (isSaturnTool) {
            index = CONFIG.saturnTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.saturnResources[index];
        } else if (isUranusTool) {
            index = CONFIG.uranusTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.uranusResources[index];
        } else if (isNeptuneTool) {
            index = CONFIG.neptuneTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.neptuneResources[index];
        }
        const resImg = resourceObj ? resourceObj.img : '';
        const resVal = resourceObj ? resourceObj.value : 0;
        const totalValue = resVal * tool.val;
        const totalValueStr = window.formatShortNumber ? window.formatShortNumber(totalValue) : totalValue;

        item.innerHTML = `
            <img src="${tool.img}" alt="${tool.name}">
            <div class="shop-name-display" id="name-${tool.id}">${tool.name}${ownedSuffix}</div>
            <div class="shop-desc" style="min-height: calc(60px * var(--s)); line-height: 1.25; margin-top: 0px; font-size: 1rem;">
                Mines ${window.formatShortNumber(tool.val)} &times; <img src="${resImg}" alt="${tool.res}" style="height: calc(35px * var(--s)); width: auto; vertical-align: middle; margin: 0 calc(2px * var(--s));"> / second<br>
                <div style="color: #ffd700; font-family: 'Lilita One', cursive; margin-top: calc(2px * var(--s)); font-size: 1.2rem;">Total of $${totalValueStr} / second</div>
            </div>
            <div class="shop-price-btn" id="price-${tool.id}">$${window.formatShortNumber(currentPrice)}</div>
        `;
        list.appendChild(item);

        const nameDisplay = item.querySelector(`#name-${tool.id}`);

        const handlePurchase = async (e) => {
            const currentPrice = getToolCurrentPrice(tool);
            if (state.playerScore < currentPrice) return;

            if (state.audioEnabled && dom.audioPurchase) {
                const audio = dom.audioPurchase.cloneNode();
                audio.volume = state.soundVolume / 100;
                audio.play().catch(err => console.log('Audio play failed:', err));
            }

            const resName = tool.res.toUpperCase();

            // Always use the mock API which now handles localStorage
            const result = await apiPost('/tools/buy', {
                tool_id: tool.id,
                amount: 1
            });

            if (result && result.success) {
                spawnBuyPopup(e, tool.name);

                // Update local state
                state.playerScore = Math.max(0, state.playerScore - currentPrice);
                state.totalSpent += currentPrice;
                state.ownedTools[tool.id] = result.total_owned;

                if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
                nameDisplay.textContent = `${tool.name} × ${state.ownedTools[tool.id]}`;

                // Update price display to show new escalated price
                const priceBtn = item.querySelector(`#price-${tool.id}`);
                if (priceBtn) priceBtn.innerHTML = `$${window.formatShortNumber(getToolCurrentPrice(tool))}`;

                // Update Auto-Mine Power
                calculateAutoMinePower();

                // Unlock Resources
                const resName = tool.res.toUpperCase();
                const isEarth = CONFIG.earthTools.some(t => t.id === tool.id);
                const isMoon = CONFIG.moonTools.some(t => t.id === tool.id);
                const isMars = CONFIG.marsTools.some(t => t.id === tool.id);
                const isJupiter = CONFIG.jupiterTools.some(t => t.id === tool.id);
                const isSaturn = CONFIG.saturnTools.some(t => t.id === tool.id);
                const isUranus = CONFIG.uranusTools.some(t => t.id === tool.id);
                const isNeptune = CONFIG.neptuneTools.some(t => t.id === tool.id);

                if (isEarth) {
                    if (!state.unlockedResources.includes(resName)) state.unlockedResources.push(resName);
                } else if (isMoon) {
                    if (!state.unlockedMoonResources.includes(resName)) state.unlockedMoonResources.push(resName);
                } else if (isMars) {
                    if (!state.unlockedMarsResources.includes(resName)) state.unlockedMarsResources.push(resName);
                } else if (isJupiter) {
                    if (!state.unlockedJupiterResources.includes(resName)) state.unlockedJupiterResources.push(resName);
                } else if (isSaturn) {
                    if (!state.unlockedSaturnResources.includes(resName)) state.unlockedSaturnResources.push(resName);
                } else if (isUranus) {
                    if (!state.unlockedUranusResources.includes(resName)) state.unlockedUranusResources.push(resName);
                } else if (isNeptune) {
                    if (!state.unlockedNeptuneResources.includes(resName)) state.unlockedNeptuneResources.push(resName);
                }

                saveLocalState();
                updateToolLockedStates();
                checkAchievements();
            } else {
                alert(result ? result.error : 'Failed to purchase tool.');
            }
        };

        // Attach click to the price button specifically
        const buyBtn = item.querySelector('.shop-price-btn');
        if (buyBtn) {
            buyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent container selection logic if any
                handlePurchase(e);
            });
        }
    });
}

function updateToolLockedStates() {
    const allTools = [
        ...CONFIG.earthTools, 
        ...CONFIG.moonTools, 
        ...CONFIG.marsTools,
        ...CONFIG.jupiterTools,
        ...CONFIG.saturnTools,
        ...CONFIG.uranusTools,
        ...CONFIG.neptuneTools
    ];
    allTools.forEach(tool => {
        const nameDisplay = document.getElementById(`name-${tool.id}`);
        if (!nameDisplay) return;

        const shopItem = nameDisplay.closest('.shop-item');
        const owned = state.ownedTools[tool.id] || 0;
        const ownedSuffix = owned > 0 ? ` × ${owned}` : '';
        const currentPrice = getToolCurrentPrice(tool);
        
        const isMoonTool = CONFIG.moonTools.some(t => t.id === tool.id);
        const isMarsTool = CONFIG.marsTools.some(t => t.id === tool.id);
        const isJupiterTool = CONFIG.jupiterTools.some(t => t.id === tool.id);
        const isSaturnTool = CONFIG.saturnTools.some(t => t.id === tool.id);
        const isUranusTool = CONFIG.uranusTools.some(t => t.id === tool.id);
        const isNeptuneTool = CONFIG.neptuneTools.some(t => t.id === tool.id);

        const isLocked = (isMoonTool && !state.playerMoonUnlocked) ||
                         (isMarsTool && !state.playerMarsUnlocked) ||
                         (isJupiterTool && !state.playerJupiterUnlocked) ||
                         (isSaturnTool && !state.playerSaturnUnlocked) ||
                         (isUranusTool && !state.playerUranusUnlocked) ||
                         (isNeptuneTool && !state.playerNeptuneUnlocked);

        if ((state.playerScore >= currentPrice || owned > 0) && !isLocked) {
            if (!state.revealedTools[tool.id]) {
                state.revealedTools[tool.id] = true;
                localStorage.setItem('worldClickerRevealedTools', JSON.stringify(state.revealedTools));
            }
        }

        shopItem.classList.remove('unrevealed-tool', 'unaffordable-tool');

        if (!state.revealedTools[tool.id]) {
            // UNREVEALED (Cannot afford and never seen)
            shopItem.classList.add('unrevealed-tool');
            nameDisplay.textContent = '????';
        } else if (state.playerScore < currentPrice) {
            // REVEALED BUT UNAFFORDABLE (Points dropped below cost)
            shopItem.classList.add('unaffordable-tool');
            nameDisplay.textContent = tool.name + ownedSuffix;
        } else {
            // AFFORDABLE
            nameDisplay.textContent = tool.name + ownedSuffix;
        }

        // Update price display
        const priceBtn = document.getElementById(`price-${tool.id}`);
        if (priceBtn) priceBtn.innerHTML = `$${window.formatShortNumber(currentPrice)}`;
    });
}

function updateShopView() {
    const listEarth = dom.shopListEarth;
    const listMoon = dom.shopListMoon;
    const listMars = dom.shopListMars;
    const listJupiter = dom.shopListJupiter;
    const listSaturn = dom.shopListSaturn;
    const listUranus = dom.shopListUranus;
    const listNeptune = dom.shopListNeptune;

    if (!listEarth || !listMoon || !listMars || !listJupiter || !listSaturn || !listUranus || !listNeptune) return;

    listEarth.classList.add('hidden');
    listMoon.classList.add('hidden');
    listMars.classList.add('hidden');
    listJupiter.classList.add('hidden');
    listSaturn.classList.add('hidden');
    listUranus.classList.add('hidden');
    listNeptune.classList.add('hidden');

    switch (state.location) {
        case 'MOON': 
            listMoon.classList.remove('hidden'); 
            break;
        case 'MARS': 
            listMars.classList.remove('hidden'); 
            break;
        case 'JUPITER': 
            listJupiter.classList.remove('hidden'); 
            break;
        case 'SATURN': 
            listSaturn.classList.remove('hidden'); 
            break;
        case 'URANUS': 
            listUranus.classList.remove('hidden'); 
            break;
        case 'NEPTUNE': 
            listNeptune.classList.remove('hidden'); 
            break;
        default: 
            listEarth.classList.remove('hidden'); 
            break;
    }
    updateToolLockedStates();
}

// --- Travel Logic ---
function updateTravelButton() {
    // No text to update - button is now a rocket image
}

function handleTravel() {
    if (state.isTravelling || !state.gameStarted) return;
    showPlanetSelector();
}

function showPlanetSelector() {
    if (!dom.planetSelectOverlay || !dom.planetButtons) return;

    dom.planetButtons.innerHTML = '';

    const planets = [
        { id: 'EARTH', name: 'Earth', preview: 'earth-preview', unlocked: true, cost: 0 },
        { id: 'MOON', name: 'The Moon', preview: 'moon-preview', unlocked: state.playerMoonUnlocked, cost: CONFIG.moonUnlockCost },
        { id: 'MARS', name: 'Mars', preview: 'mars-preview', unlocked: state.playerMarsUnlocked, cost: CONFIG.marsUnlockCost },
        { id: 'JUPITER', name: 'Jupiter', preview: 'jupiter-preview', unlocked: state.playerJupiterUnlocked, cost: CONFIG.jupiterUnlockCost },
        { id: 'SATURN', name: 'Saturn', preview: 'saturn-preview', unlocked: state.playerSaturnUnlocked, cost: CONFIG.saturnUnlockCost },
        { id: 'URANUS', name: 'Uranus', preview: 'uranus-preview', unlocked: state.playerUranusUnlocked, cost: CONFIG.uranusUnlockCost },
        { id: 'NEPTUNE', name: 'Neptune', preview: 'neptune-preview', unlocked: state.playerNeptuneUnlocked, cost: CONFIG.neptuneUnlockCost }
    ];

    planets.forEach(planet => {
        if (planet.id === state.location) return; // Skip current planet

        const btn = document.createElement('button');
        btn.className = 'planet-btn';

        const preview = document.createElement('div');
        preview.className = `planet-btn-preview ${planet.preview}`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'planet-btn-name';
        nameSpan.textContent = planet.name;

        btn.appendChild(preview);
        btn.appendChild(nameSpan);

        if (!planet.unlocked) {
            btn.classList.add('locked');
            btn.dataset.unlockCost = planet.cost; // Store cost for real-time updates
            
            // Add Overlay and Lock Icon to the preview
            const overlay = document.createElement('div');
            overlay.className = 'planet-preview-overlay';
            overlay.innerHTML = '<i class="fa-solid fa-lock"></i>';
            preview.appendChild(overlay);

            const costDiv = document.createElement('div');
            costDiv.className = 'planet-btn-cost';
            costDiv.innerHTML = `$${window.formatShortNumber(planet.cost).trim()}`;
            btn.appendChild(costDiv);

            if (state.playerScore < planet.cost) {
                btn.classList.add('disabled');
            }
        }

        btn.addEventListener('click', () => {
            handlePlanetSelect(planet);
        });

        dom.planetButtons.appendChild(btn);
    });

    dom.planetSelectOverlay.classList.remove('hidden');
}

/**
 * Checks all locked/disabled planet buttons in the travel popup and removes 'disabled'
 * if the player's score now meets the unlock cost.
 */
function updatePlanetSelectAvailability() {
    if (!dom.planetSelectOverlay || dom.planetSelectOverlay.classList.contains('hidden')) return;

    const lockedBtns = dom.planetSelectOverlay.querySelectorAll('.planet-btn.locked.disabled');
    lockedBtns.forEach(btn => {
        const cost = parseFloat(btn.dataset.unlockCost);
        if (!isNaN(cost) && state.playerScore >= cost) {
            btn.classList.remove('disabled');
        }
    });
}

function handlePlanetSelect(planet) {
    // If not unlocked, pay the cost
    if (!planet.unlocked) {
        if (state.playerScore < planet.cost) return;

        if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
        checkAchievements();

        if (state.audioEnabled && dom.audioPurchase) {
            const sound = dom.audioPurchase.cloneNode();
            sound.volume = state.soundVolume / 100;
            sound.play().catch(() => { });
        }

        if (planet.id === 'MOON') {
            state.playerMoonUnlocked = true;
            localStorage.setItem('worldClickerPlayerMoonUnlocked', 'true');
        } else if (planet.id === 'MARS') {
            state.playerMarsUnlocked = true;
            localStorage.setItem('worldClickerPlayerMarsUnlocked', 'true');
        } else if (planet.id === 'JUPITER') {
            state.playerJupiterUnlocked = true;
            localStorage.setItem('worldClickerPlayerJupiterUnlocked', 'true');
        } else if (planet.id === 'SATURN') {
            state.playerSaturnUnlocked = true;
            localStorage.setItem('worldClickerPlayerSaturnUnlocked', 'true');
        } else if (planet.id === 'URANUS') {
            state.playerUranusUnlocked = true;
            localStorage.setItem('worldClickerPlayerUranusUnlocked', 'true');
        } else if (planet.id === 'NEPTUNE') {
            state.playerNeptuneUnlocked = true;
            localStorage.setItem('worldClickerPlayerNeptuneUnlocked', 'true');
        }

        saveLocalState();
        updateToolLockedStates();
    }

    // Close popup and travel
    dom.planetSelectOverlay.classList.add('hidden');
    executeAnimation(planet.id);
}

function updateResourceIcons() {
    const iconsColumn = document.querySelector('.resources-icons-column');
    const namesColumn = document.querySelector('.resources-names-column');
    if (!iconsColumn) return;

    const pool = getResourcePool();

    const icons = iconsColumn.querySelectorAll('.resource-slot img');
    const names = namesColumn ? namesColumn.querySelectorAll('.resource-slot span') : [];

    icons.forEach((icon, domIndex) => {
        const resourceIndex = pool.length - 1 - domIndex;
        if (resourceIndex >= 0 && resourceIndex < pool.length) {
            icon.src = pool[resourceIndex].img;
            icon.alt = pool[resourceIndex].name;
            if (names[domIndex]) names[domIndex].textContent = pool[resourceIndex].name;
        }
    });

    updateHeatBarUI();
}

function getSystemForLocation(loc) {
    if (loc === 'NEPTUNE') return dom.neptuneSystem;
    if (loc === 'URANUS') return dom.uranusSystem;
    if (loc === 'SATURN') return dom.saturnSystem;
    if (loc === 'JUPITER') return dom.jupiterSystem;
    if (loc === 'MARS') return dom.marsSystem;
    if (loc === 'MOON') return dom.moonSystem;
    return dom.earthSystem;
}

function executeAnimation(destination) {
    // Hide planet selector if visible
    if (dom.planetSelectOverlay) {
        dom.planetSelectOverlay.classList.add('hidden');
    }

    state.isTravelling = true;
    dom.btnTravel.classList.remove('visible');

    const currentLoc = state.location;
    const allLocations = ['EARTH', 'MOON', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE'];

    // Instantly reset any non-current, non-destination planets to off-screen-right
    allLocations.forEach(loc => {
        if (loc === currentLoc || loc === destination) return;
        const sys = getSystemForLocation(loc);
        if (sys) {
            sys.style.transition = 'none';
            sys.classList.remove('off-screen-left');
            sys.classList.add('off-screen-right');
            sys.offsetHeight; // force reflow
            sys.style.transition = '';
        }
    });

    // Current planet slides off-screen left
    const currentSys = getSystemForLocation(currentLoc);
    if (currentSys) currentSys.classList.add('off-screen-left');

    // Destination planet slides in from right
    const destSys = getSystemForLocation(destination);
    if (destSys) {
        destSys.classList.remove('off-screen-right');
        destSys.classList.remove('off-screen-left');
    }

    state.location = destination;
    state.totalTravels = (state.totalTravels || 0) + 1;

    updateShopView();
    updateResourceIcons();
    checkAchievements();

    setTimeout(() => {
        state.isTravelling = false;

        // Reset old planet to off-screen-right (so it comes from right next time)
        if (currentSys) {
            currentSys.style.transition = 'none';
            currentSys.classList.remove('off-screen-left');
            currentSys.classList.add('off-screen-right');
            currentSys.offsetHeight;
            currentSys.style.transition = '';
        }

        dom.btnTravel.classList.add('visible');
    }, 1500);
}

// Track if touch event was recently handled to prevent synthetic mouse events
let lastTouchTime = 0;
let lastHeatClickTime = 0; // performance.now() timestamp for heat grace period

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

    // --- Start Game Logic (Legacy removed) ---
    // Interaction handling moved to handlePlayClick

    // --- Mining Logic ---
    // Prevent interaction during travel
    if (state.isTravelling) return;

    // Rate Limit - prevent double clicks
    if (now - state.lastClickTime < CONFIG.clickRateLimitMs) return;

    state.lastClickTime = now;
    state.totalClicks++;

    // --- Heat Bar Logic ---
    // Increase heat on click, max 100 (only after game started)
    state.clickHeat = Math.min(100, state.clickHeat + (CONFIG.heatIncreasePerClick || 1));
    lastHeatClickTime = performance.now();
    updateHeatBarUI();

    if (state.audioEnabled && dom.audioClick) {
        const sound = dom.audioClick.cloneNode();
        sound.volume = state.soundVolume / 100;
        sound.play().catch(() => { });
    }

    const resource = getHeatResource();
    const multipliedValue = resource.value * state.manualMultiplier;
    
    checkChallengeMine(resource);
    
    // Track resource count locally
    const resKey = resource.name.toUpperCase();
    state.minedResourcesCount[resKey] = (state.minedResourcesCount[resKey] || 0) + state.manualMultiplier;

    state.playerScore += multipliedValue; // Increment individual score
    state.score += multipliedValue;       // Increment total group score
    state.totalEarned += multipliedValue;
    state.totalManualMines = (state.totalManualMines || 0) + 1;

    // Update UI
    if (dom.playerScoreDisplay) {
        dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
        triggerScorePopup();
    }
    if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);

    // Update shop silhouettes dynamically
    updateToolLockedStates();
    checkAchievements();
    updatePlanetSelectAvailability();

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

    const popupRes = { ...resource, value: multipliedValue };
    spawnPopup(clientX, clientY, popupRes);

    saveLocalState();

    // Animation Pulse (Target dynamic system's wrapper)
    const systemEl = getSystemForLocation(state.location);

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

// Update displayed player score every 1 second (auto-mine tick)
function tickPlayerScore() {
    if (!state.gameStarted) return;

    // Auto Mining Logic
    const allTools = [
        ...CONFIG.earthTools, 
        ...CONFIG.moonTools, 
        ...CONFIG.marsTools,
        ...CONFIG.jupiterTools,
        ...CONFIG.saturnTools,
        ...CONFIG.uranusTools,
        ...CONFIG.neptuneTools
    ];

    let autoMinePower = 0;
    allTools.forEach(tool => {
        const owned = state.ownedTools[tool.id] || 0;
        if (owned > 0) {
            const units = tool.val * owned;
            const resKey = tool.res.toUpperCase();
            state.minedResourcesCount[resKey] = (state.minedResourcesCount[resKey] || 0) + units;
            
            // Calculate dollar value for score update
            const pool = [
                ...CONFIG.resources, 
                ...CONFIG.moonResources, 
                ...CONFIG.marsResources,
                ...CONFIG.jupiterResources,
                ...CONFIG.saturnResources,
                ...CONFIG.uranusResources,
                ...CONFIG.neptuneResources
            ];
            const resVal = pool.find(r => r.name === resKey)?.value || 0;
            autoMinePower += (units * resVal);
        }
    });

    if (autoMinePower > 0) {
        state.playerScore += autoMinePower;
        state.score += autoMinePower;
        state.totalEarned += autoMinePower;

        if (dom.playerScoreDisplay) {
            dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
            triggerScorePopup();
        }
        if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);

        saveLocalState();
        updateToolLockedStates();
    }
    checkAchievements();
    updatePlanetSelectAvailability();
}

function calculateAutoMinePower() {
    let power = 0;
    const allTools = [
        ...CONFIG.earthTools, 
        ...CONFIG.moonTools, 
        ...CONFIG.marsTools,
        ...CONFIG.jupiterTools,
        ...CONFIG.saturnTools,
        ...CONFIG.uranusTools,
        ...CONFIG.neptuneTools
    ];
    allTools.forEach(tool => {
        const owned = state.ownedTools[tool.id] || 0;
        if (owned > 0) {
            const resName = tool.res.toUpperCase();
            const resVal = [
                ...CONFIG.resources, 
                ...CONFIG.moonResources, 
                ...CONFIG.marsResources,
                ...CONFIG.jupiterResources,
                ...CONFIG.saturnResources,
                ...CONFIG.uranusResources,
                ...CONFIG.neptuneResources
            ].find(r => r.name === resName)?.value || 1;
            power += (tool.val * owned * resVal);
        }
    });
    return power;
}

function startAutoMine() {
    if (autoMineInterval) clearInterval(autoMineInterval);
    autoMineInterval = setInterval(tickPlayerScore, 1000);
}

// --- Initialization ---
// Load config from config.js (loaded as a script tag, no server needed)
function loadConfig() {
    if (typeof GAME_CONFIG === 'undefined') {
        console.log('⚠️ config.js not found, using defaults');
        return;
    }

    if (GAME_CONFIG.priceMultiplier) CONFIG.priceMultiplier = GAME_CONFIG.priceMultiplier;
    if (GAME_CONFIG.moonUnlockCost) CONFIG.moonUnlockCost = GAME_CONFIG.moonUnlockCost;
    if (GAME_CONFIG.marsUnlockCost) CONFIG.marsUnlockCost = GAME_CONFIG.marsUnlockCost;

    // Apply earth tool prices
    if (GAME_CONFIG.earthToolPrices) {
        CONFIG.earthTools.forEach(tool => {
            if (GAME_CONFIG.earthToolPrices[tool.id] !== undefined) {
                tool.price = GAME_CONFIG.earthToolPrices[tool.id];
            }
        });
    }

    // Apply moon tool prices
    if (GAME_CONFIG.moonToolPrices) {
        CONFIG.moonTools.forEach(tool => {
            if (GAME_CONFIG.moonToolPrices[tool.id] !== undefined) {
                tool.price = GAME_CONFIG.moonToolPrices[tool.id];
            }
        });
    }

    console.log('✅ config.js loaded successfully');
}

async function init() {
    // Load config overrides first
    loadConfig();

    // --- Instant Local Load & Display ---
    // Use Number() instead of parseInt() to handle very large scores in scientific notation (e.g. 1e15)
    const storedScore = localStorage.getItem('worldClickerScore');
    if (storedScore) {
        state.score = Number(storedScore) || 0;
        if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);
    }

    const storedPlayerScore = localStorage.getItem('worldClickerPlayerScore');
    if (storedPlayerScore) {
        state.playerScore = Number(storedPlayerScore) || 0;
        if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
    }

    const storedEarned = localStorage.getItem('worldClickerTotalEarned');
    if (storedEarned) state.totalEarned = Number(storedEarned);

    const storedSpent = localStorage.getItem('worldClickerTotalSpent');
    if (storedSpent) state.totalSpent = Number(storedSpent);

    const storedClicks = localStorage.getItem('worldClickerTotalClicks');
    if (storedClicks) state.totalClicks = Number(storedClicks);

    const storedTime = localStorage.getItem('worldClickerTimePlayed');
    if (storedTime) state.timePlayedSeconds = parseFloat(storedTime);

    const storedTools = localStorage.getItem('worldClickerOwnedTools') || localStorage.getItem('worldClickerGuestTools');
    if (storedTools) {
        try {
            state.ownedTools = JSON.parse(storedTools);
            // Migrate guest tools to uniform key
            localStorage.setItem('worldClickerOwnedTools', JSON.stringify(state.ownedTools));
        } catch (e) { }
    }

    if (localStorage.getItem('worldClickerPlayerMoonUnlocked') === 'true') {
        state.playerMoonUnlocked = true;
    }
    if (localStorage.getItem('worldClickerPlayerMarsUnlocked') === 'true') {
        state.playerMarsUnlocked = true;
    }
    if (localStorage.getItem('worldClickerPlayerJupiterUnlocked') === 'true') {
        state.playerJupiterUnlocked = true;
    }
    if (localStorage.getItem('worldClickerPlayerSaturnUnlocked') === 'true') {
        state.playerSaturnUnlocked = true;
    }
    if (localStorage.getItem('worldClickerPlayerUranusUnlocked') === 'true') {
        state.playerUranusUnlocked = true;
    }
    if (localStorage.getItem('worldClickerPlayerNeptuneUnlocked') === 'true') {
        state.playerNeptuneUnlocked = true;
    }

    const revealed = localStorage.getItem('worldClickerRevealedTools');
    if (revealed) {
        try {
            state.revealedTools = JSON.parse(revealed);
        } catch (e) { }
    }

    const storedMined = localStorage.getItem('worldClickerMinedResourcesCount');
    if (storedMined) {
        try {
            state.minedResourcesCount = JSON.parse(storedMined);
        } catch (e) { }
    }
    
    // Load Challenge Stats
    const storedChallengesCompleted = localStorage.getItem('worldClickerChallengesCompleted');
    if (storedChallengesCompleted) state.challengesCompleted = parseInt(storedChallengesCompleted, 10);
    
    const storedChallengesFailed = localStorage.getItem('worldClickerChallengesFailed');
    if (storedChallengesFailed) state.challengesFailed = parseInt(storedChallengesFailed, 10);
    
    const storedFastestTime = localStorage.getItem('worldClickerFastestChallengeTime');
    if (storedFastestTime !== null && storedFastestTime !== "") state.fastestChallengeTime = parseFloat(storedFastestTime);
    
    const storedChallengeRewards = localStorage.getItem('worldClickerTotalChallengeRewards');
    if (storedChallengeRewards) state.totalChallengeRewards = parseFloat(storedChallengeRewards);

    // Load Achievement Trackers
    const storedTravels = localStorage.getItem('worldClickerTotalTravels');
    if (storedTravels) state.totalTravels = parseInt(storedTravels, 10);

    const storedManualMines = localStorage.getItem('worldClickerTotalManualMines');
    if (storedManualMines) state.totalManualMines = parseInt(storedManualMines, 10);

    const storedMaxHeatCount = localStorage.getItem('worldClickerMaxHeatReachedCount');
    if (storedMaxHeatCount) state.maxHeatReachedCount = parseInt(storedMaxHeatCount, 10);

    const storedMaxHeatTime = localStorage.getItem('worldClickerTotalMaxHeatTime');
    if (storedMaxHeatTime) state.totalMaxHeatTime = parseInt(storedMaxHeatTime, 10);

    const storedMaxMultiplierCount = localStorage.getItem('worldClickerMaxMultiplierReachedCount');
    if (storedMaxMultiplierCount) state.maxMultiplierReachedCount = parseInt(storedMaxMultiplierCount, 10);

    const storedMaxMultiplierTime = localStorage.getItem('worldClickerTotalMaxMultiplierTime');
    if (storedMaxMultiplierTime) state.totalMaxMultiplierTime = parseInt(storedMaxMultiplierTime, 10);

    const storedAchievements = localStorage.getItem('worldClickerAchievementsUnlocked');
    if (storedAchievements) {
        try { state.achievementsUnlocked = JSON.parse(storedAchievements); } catch (e) { }
    }

    const storedMedals = localStorage.getItem('worldClickerMedalsUnlocked');
    if (storedMedals) {
        try { state.medalsUnlocked = JSON.parse(storedMedals); } catch (e) { }
    }

    // Score initialization (redundant, handled at top of init)
    // if (state.score === 0 && storedScore) state.score = parseInt(storedScore, 10);
    // if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);

    // Initial Custom Scrollbar Sync for Statistics
    setTimeout(() => {
        initCustomScrollbar('stats-resources-grid-container', 'vertical');
        initCustomScrollbar('stats-tools-grid-container', 'vertical');
    }, 1000);

    // Unlocked resources calculation
    Object.keys(state.ownedTools).forEach(toolId => {
        const earthTool = CONFIG.earthTools.find(t => t.id === toolId);
        if (earthTool && !state.unlockedResources.includes(earthTool.res.toUpperCase())) {
            state.unlockedResources.push(earthTool.res.toUpperCase());
        }
        const moonTool = CONFIG.moonTools.find(t => t.id === toolId);
        if (moonTool && !state.unlockedMoonResources.includes(moonTool.res.toUpperCase())) {
            state.unlockedMoonResources.push(moonTool.res.toUpperCase());
        }
        const marsTool = CONFIG.marsTools.find(t => t.id === toolId);
        if (marsTool && !state.unlockedMarsResources.includes(marsTool.res.toUpperCase())) {
            state.unlockedMarsResources.push(marsTool.res.toUpperCase());
        }
        const jupiterTool = CONFIG.jupiterTools.find(t => t.id === toolId);
        if (jupiterTool && !state.unlockedJupiterResources.includes(jupiterTool.res.toUpperCase())) {
            state.unlockedJupiterResources.push(jupiterTool.res.toUpperCase());
        }
        const saturnTool = CONFIG.saturnTools.find(t => t.id === toolId);
        if (saturnTool && !state.unlockedSaturnResources.includes(saturnTool.res.toUpperCase())) {
            state.unlockedSaturnResources.push(saturnTool.res.toUpperCase());
        }
        const uranusTool = CONFIG.uranusTools.find(t => t.id === toolId);
        if (uranusTool && !state.unlockedUranusResources.includes(uranusTool.res.toUpperCase())) {
            state.unlockedUranusResources.push(uranusTool.res.toUpperCase());
        }
        const neptuneTool = CONFIG.neptuneTools.find(t => t.id === toolId);
        if (neptuneTool && !state.unlockedNeptuneResources.includes(neptuneTool.res.toUpperCase())) {
            state.unlockedNeptuneResources.push(neptuneTool.res.toUpperCase());
        }
    });

    if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
    if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);

    // If we have a cached country code, set it immediately so the first poll works
    const cachedCode = localStorage.getItem('worldClickerCountryCode');
    const cachedName = localStorage.getItem('worldClickerCountryName');
    if (cachedCode && !state.country) {
        state.country = { code: cachedCode, name: cachedName || cachedCode };
    }

    // Initialize shop DOM logic
    renderShopList(CONFIG.earthTools, 'shop-list-earth');
    renderShopList(CONFIG.moonTools, 'shop-list-moon');
    renderShopList(CONFIG.marsTools, 'shop-list-mars');
    renderShopList(CONFIG.jupiterTools, 'shop-list-jupiter');
    renderShopList(CONFIG.saturnTools, 'shop-list-saturn');
    renderShopList(CONFIG.uranusTools, 'shop-list-uranus');
    renderShopList(CONFIG.neptuneTools, 'shop-list-neptune');
    updateShopView();
    updateResourceIcons(); // Populate resource icons immediately on load

    // Start Local Autominers
    // Moved to handlePlayClick to prevent background mining before start


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
    if (dom.marsZone) {
        dom.marsZone.addEventListener('mousedown', handleMine);
        dom.marsZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    if (dom.jupiterZone) {
        dom.jupiterZone.addEventListener('mousedown', handleMine);
        dom.jupiterZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    if (dom.saturnZone) {
        dom.saturnZone.addEventListener('mousedown', handleMine);
        dom.saturnZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    if (dom.uranusZone) {
        dom.uranusZone.addEventListener('mousedown', handleMine);
        dom.uranusZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    if (dom.neptuneZone) {
        dom.neptuneZone.addEventListener('mousedown', handleMine);
        dom.neptuneZone.addEventListener('touchstart', handleMine, { passive: true });
    }
    // --- Global Controls ---

    // Travel
    if (dom.btnTravel) dom.btnTravel.addEventListener('click', handleTravel);

    // Planet Selection Popup Close
    if (dom.btnPlanetSelectClose) dom.btnPlanetSelectClose.addEventListener('click', () => {
        if (dom.planetSelectOverlay) dom.planetSelectOverlay.classList.add('hidden');
    });

    // Settings
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', openSettings);

    const btnSettingsClose = document.getElementById('btn-settings-close');
    if (btnSettingsClose) btnSettingsClose.addEventListener('click', closeSettings);

    // Stats Button
    const btnStats = document.getElementById('btn-stats');
    if (btnStats) btnStats.addEventListener('click', openStats);

    const btnStatsClose = document.getElementById('btn-stats-close');
    if (btnStatsClose) btnStatsClose.addEventListener('click', closeStats);

    // Achievements Button
    const btnAwards = document.getElementById('btn-awards');
    if (btnAwards) {
        btnAwards.addEventListener('click', () => {
            initAchievementsGrid();
            initAwardsGrid();
            const overlay = document.getElementById('achievements-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                initCustomScrollbar('awards-grid-container', 'horizontal');
                initCustomScrollbar('achievements-grid-container', 'vertical');
            }
        });
    }

    const btnAchievementsClose = document.getElementById('btn-achievements-close');
    if (btnAchievementsClose) {
        btnAchievementsClose.addEventListener('click', () => {
            const overlay = document.getElementById('achievements-overlay');
            if (overlay) overlay.classList.add('hidden');
        });
    }



    const sliderMusic = document.getElementById('slider-music');
    if (sliderMusic) sliderMusic.addEventListener('input', handleMusicSlider);

    const sliderSound = document.getElementById('slider-sound');
    if (sliderSound) sliderSound.addEventListener('input', handleSoundSlider);

    const btnErase = document.getElementById('btn-erase-cache');
    if (btnErase) btnErase.addEventListener('click', handleEraseCache);

    // Info Button
    const btnInfo = document.getElementById('btn-info');
    if (btnInfo) btnInfo.addEventListener('click', openInfo);

    const btnInfoClose = document.getElementById('btn-info-close');
    if (btnInfoClose) btnInfoClose.addEventListener('click', closeInfo);

    // --- Click Outside to Close Popups ---
    const popupOverlays = [
        'stats-overlay',
        'achievements-overlay',
        'settings-overlay',
        'planet-select-overlay',
        'info-overlay' // Including info for consistency
    ];

    popupOverlays.forEach(id => {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.addEventListener('mousedown', (e) => {
                // If the click target is the overlay itself (the backdrop), not its children
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    // Special case for mobile menu if needed, but handled separately below
                }
            });
        }
    });



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
        document.getElementById('btn-mobile-music').addEventListener('click', openSettings);
    }
    if (document.getElementById('btn-mobile-audio')) {
        document.getElementById('btn-mobile-audio').addEventListener('click', (e) => {
            e.stopPropagation();
            openSettings();
        });
    }
    if (document.getElementById('btn-mobile-help')) {
        document.getElementById('btn-mobile-help').addEventListener('click', () => { 
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('active');
                setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
            }
            openInfo(); 
        });
    }

    document.addEventListener('dragstart', e => e.preventDefault());

    document.addEventListener('contextmenu', e => e.preventDefault());

    // gameLoop handles passive logic
    gameLoop();
    
    // Init challenge system
    initChallengeSystem();

    // Reset statistics scroll positions to top on load
    const statsResources = document.getElementById('stats-resources-grid-container');
    const statsTools = document.getElementById('stats-tools-grid-container');
    if (statsResources) statsResources.scrollTop = 0;
    if (statsTools) statsTools.scrollTop = 0;

    // Reset shop scroll to top on load
    const shopViewport = document.getElementById('shop-list-viewport');
    if (shopViewport) shopViewport.scrollTop = 0;

    // Reset shop scroll on planet switch (class change on shop-list)
    if (shopViewport) {
        const observer = new MutationObserver(() => {
            shopViewport.scrollTop = 0;
        });
        const lists = shopViewport.querySelectorAll('.shop-list');
        lists.forEach(l => observer.observe(l, { attributes: true, attributeFilter: ['class'] }));
    }

    // Enforce fullscreen on mobile
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check for any missed achievements (e.g. from existing progress)
    checkAchievements();
}

function handleFullscreenChange() {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

    if (isMobile && !isFullscreen && state.gameStarted) {
        // Player exited fullscreen on mobile, pause game
        state.gameStarted = false;

        // Show the loading overlay again
        if (dom.loadingOverlay) {
            dom.loadingOverlay.classList.remove('hidden');
            dom.loadingOverlay.classList.remove('loading-fading');

            // Ensure the Play button is ready
            if (dom.loadingBarContainer) dom.loadingBarContainer.classList.add('hidden');
            if (dom.btnPlayGame) dom.btnPlayGame.classList.add('enabled');
        }

        // We don't clear the autoMineInterval since tickPlayerScore is already guarded by state.gameStarted.
        // This ensures the game pauses without completely resetting the timer cycle.
    }
}


// Update Heat Bar UI
function updateHeatBarUI() {
    if (!dom.heatBarFill) return;

    // Convert 0-100% heat to 100-0% inset clip-path
    // High heat = 0% inset (fully visible)
    // Low heat = 100% inset (fully hidden)
    const insetVal = 100 - state.clickHeat;

    // Always use vertical masking (reveal from bottom to top)
    dom.heatBarFill.style.clipPath = `inset(${insetVal}% 0 0 0)`;

    // Highlight the active resource icon and name based on the current heat zone
    const iconsColumn = document.querySelector('.resources-icons-column');
    const namesColumn = document.querySelector('.resources-names-column');
    if (iconsColumn) {
        const icons = iconsColumn.querySelectorAll('.resource-slot img');
        const names = namesColumn ? namesColumn.querySelectorAll('.resource-slot span') : [];

        // If heat is 0, all icons should be inactive
        if (state.clickHeat <= 0) {
            icons.forEach(icon => icon.classList.remove('resource-icon-active'));
            names.forEach(name => name.classList.remove('resource-name-active'));
        } else {
            // Heat zone: 0-10% = zone 0 (Wood), 90-100% = zone 9 (Diamond)
            let activeZone = Math.floor(state.clickHeat / 10);
            if (activeZone >= icons.length) activeZone = icons.length - 1;
            if (activeZone < 0) activeZone = 0;

            icons.forEach((icon, index) => {
                // Icons in DOM are top-to-bottom (Diamond=0, Wood=9)
                const reversedIndex = icons.length - 1 - index;
                if (reversedIndex === activeZone) {
                    icon.classList.add('resource-icon-active');
                } else {
                    icon.classList.remove('resource-icon-active');
                }
            });

            names.forEach((name, index) => {
                const reversedIndex = names.length - 1 - index;
                if (reversedIndex === activeZone) {
                    name.classList.add('resource-name-active');
                } else {
                    name.classList.remove('resource-name-active');
                }
            });
        }
    }

    // Achievement: Reach max heat tracker
    if (state.clickHeat >= 100) {
        if (!state.atMaxHeat) {
            state.atMaxHeat = true;
            state.maxHeatReachedCount = (state.maxHeatReachedCount || 0) + 1;
            state.currentMaxHeatRowStartTime = Date.now();
            checkAchievements();
        }
    } else {
        state.atMaxHeat = false;
        state.currentMaxHeatRowStartTime = null;
    }
}

/**
 * Checks all 50 achievement conditions and unlocks them if met.
 */
function checkAchievements() {
    let unlockedAny = false;

    // Helper: Unlock if not already unlocked
    const unlock = (id) => {
        if (!state.achievementsUnlocked[id]) {
            state.achievementsUnlocked[id] = true;
            unlockedAny = true;
            showUnlockNotification('achievement', id);
        }
    };

    // 1-6: Wealth & Manual Clicks
    if (state.totalClicks >= 1) unlock(1);
    if (state.playerScore >= 100000) unlock(2);
    if (state.playerScore >= 1000000) unlock(3);
    if (state.playerScore >= 1000000000) unlock(4);
    if (state.playerScore >= 1000000000000) unlock(5);
    if (state.playerScore >= 1000000000000000) unlock(6);

    // 7-9: Planets
    if (state.playerMoonUnlocked) unlock(7);
    let planetCount = 0; // Exclude Earth
    if (state.playerMoonUnlocked) planetCount++;
    if (state.playerMarsUnlocked) planetCount++;
    if (state.playerJupiterUnlocked) planetCount++;
    if (state.playerSaturnUnlocked) planetCount++;
    if (state.playerUranusUnlocked) planetCount++;
    if (state.playerNeptuneUnlocked) planetCount++;
    if (planetCount >= 3) unlock(8);
    if (planetCount >= 6) unlock(9); // All 6 additional planets

    // 10-15: Tool Count
    let totalTools = 0;
    Object.values(state.ownedTools).forEach(q => totalTools += q);
    if (totalTools >= 1) unlock(10);
    if (totalTools >= 5) unlock(11);
    if (totalTools >= 25) unlock(12);
    if (totalTools >= 100) unlock(13);
    if (totalTools >= 250) unlock(14);
    if (totalTools >= 500) unlock(15);

    // 16-20: Auto Power (Note: state.autoMinePower is updated in tickPlayerScore)
    const amp = calculateAutoMinePower() || 0;
    if (amp >= 500000) unlock(16);
    if (amp >= 500000000) unlock(17);
    if (amp >= 500000000000) unlock(18);
    if (amp >= 500000000000000) unlock(19);
    if (amp >= 500000000000000000) unlock(20);

    // 21-27: Engineers (Tool Collectors)
    const checkPlanetTools = (tools) => tools.every(t => (state.ownedTools[t.id] || 0) > 0);
    if (checkPlanetTools(CONFIG.earthTools)) unlock(21);
    if (checkPlanetTools(CONFIG.moonTools)) unlock(22);
    if (checkPlanetTools(CONFIG.marsTools)) unlock(23);
    if (checkPlanetTools(CONFIG.jupiterTools)) unlock(24);
    if (checkPlanetTools(CONFIG.saturnTools)) unlock(25);
    if (checkPlanetTools(CONFIG.uranusTools)) unlock(26);
    if (checkPlanetTools(CONFIG.neptuneTools)) unlock(27);

    // 28-31: Multiplier Records (Hitting MAX manual multiplier)
    if (state.maxMultiplierReachedCount >= 1) unlock(28);
    if (state.maxMultiplierReachedCount >= 20) unlock(29);
    if (state.currentMaxMultiplierRowStartTime) {
        const streak = (Date.now() - state.currentMaxMultiplierRowStartTime) / 1000;
        if (streak >= 60) unlock(30);
    }
    if (state.totalMaxMultiplierTime >= 300) unlock(31);
    if (state.totalMaxMultiplierTime >= 600) unlock(32);

    // 33-37: Challenges
    if (state.challengesCompleted >= 1) unlock(33);
    if (state.challengesCompleted >= 5) unlock(34);
    if (state.challengesCompleted >= 10) unlock(35);
    if (state.challengesCompleted >= 25) unlock(36);
    if (state.challengesCompleted >= 50) unlock(37);

    // 38-40: Click Milestone
    if (state.totalClicks >= 1000) unlock(38);
    if (state.totalClicks >= 10000) unlock(39);
    if (state.totalClicks >= 100000) unlock(40);

    // 41-42: Travel
    if (state.totalTravels >= 25) unlock(41);
    if (state.totalTravels >= 100) unlock(42);

    // 43-46: Play Time
    const tp = state.timePlayedSeconds || 0;
    if (tp >= 3600) unlock(43);
    if (tp >= 9000) unlock(44);
    if (tp >= 18000) unlock(45);
    if (tp >= 36000) unlock(46);

    // 47-48: Manual Mining
    if (state.totalManualMines >= 5000) unlock(47);
    if (state.totalManualMines >= 50000) unlock(48);

    // 49-50: Big Spender
    if (state.totalSpent >= 1000000000000000) unlock(49);
    if (state.totalSpent >= 10000000000000000) unlock(50);

    if (unlockedAny) {
        saveLocalState();
        checkMedals();
        // Redraw grids if they are currently open/initialized
        initAchievementsGrid();
        initAwardsGrid();
    }
}

/**
 * Checks count of achievements to unlock medals.
 */
function checkMedals() {
    const unlockedCount = Object.keys(state.achievementsUnlocked).length;
    let unlockedAnyMedal = false;

    // Unlock one medal for every 5 achievements
    for (let i = 1; i <= 10; i++) {
        if (unlockedCount >= i * 5) {
            if (!state.medalsUnlocked[i]) {
                state.medalsUnlocked[i] = true;
                unlockedAnyMedal = true;
                
                showUnlockNotification('medal', i);
                
                // One-time Bonus: 10% of current Total Earned
                const bonus = (state.totalEarned || 0) * 0.1;
                if (bonus > 0) {
                    state.playerScore += bonus;
                    state.score += bonus;
                    state.totalEarned += bonus;

                    // Trigger Green Flash Animation on Score Display
                    if (dom.playerScoreDisplay) {
                        dom.playerScoreDisplay.classList.remove('challenge-won-flash');
                        void dom.playerScoreDisplay.offsetWidth; // Force reflow
                        dom.playerScoreDisplay.classList.add('challenge-won-flash');
                        
                        setTimeout(() => {
                            dom.playerScoreDisplay.classList.remove('challenge-won-flash');
                        }, 2500);
                        
                        // Update UI immediately for scores
                        dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
                    }
                    if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);
                }
            }
        }
    }

    if (unlockedAnyMedal) {
        saveLocalState();
        initAwardsGrid();
    }
}


let lastFrameTime = performance.now();

// --- Main Game Loop (for passive visual logic) ---
function gameLoop() {
    const now = performance.now();
    const dt = (now - lastFrameTime) / 1000; // Delta time in seconds
    lastFrameTime = now;

    if (state.gameStarted) {
        state.timePlayedSeconds += dt;
        
        // Achievement: Track total time at max heat
        if (state.clickHeat >= 100) {
            state.totalMaxHeatTime = (state.totalMaxHeatTime || 0) + dt;
        }

        // Manual Mining Multiplier Logic
        if (state.clickHeat >= 90) {
            state.timeAtTopHeat += dt;
            const maxMult = CONFIG.manualMultiplierMax || 32;
            const interval = CONFIG.manualMultiplierIntervalSeconds || 15;
            const intervals = Math.floor(state.timeAtTopHeat / interval);
            const newMult = Math.min(maxMult, Math.pow(2, intervals));
            
            if (newMult > state.manualMultiplier) {
                // Ghost Logic: Create a static fading clone of the full bar before it resets
                if (dom.multiplierBarFill && dom.multiplierBarFill.parentElement) {
                    const ghost = dom.multiplierBarFill.cloneNode(true);
                    ghost.removeAttribute('id');
                    ghost.classList.add('multiplier-bar-fade-out');
                    dom.multiplierBarFill.parentElement.appendChild(ghost);
                    
                    // Cleanup ghost after animation completes (500ms + buffer)
                    setTimeout(() => {
                        if (ghost.parentElement) ghost.remove();
                    }, 600);
                }

                state.manualMultiplier = newMult;
                triggerMultiplierPop();
            }
            state.multiplierDecayAccumulator = 0;
        } else if (state.manualMultiplier > 1) {
            // Rapid countdown decay
            state.multiplierDecayAccumulator += dt;
            if (state.multiplierDecayAccumulator >= 0.1) { // Quick 100ms steps
                state.manualMultiplier /= 2;
                if (state.manualMultiplier < 1) state.manualMultiplier = 1;
                
                // Sync timeAtTopHeat to the new level
                const interval = CONFIG.manualMultiplierIntervalSeconds || 15;
                state.timeAtTopHeat = Math.log2(state.manualMultiplier) * interval;
                
                triggerMultiplierPop();
                state.multiplierDecayAccumulator = 0;
            }
        } else {
            state.timeAtTopHeat = 0;
            state.manualMultiplier = 1;
            state.multiplierDecayAccumulator = 0;
        }

        if (dom.multiplierValue) dom.multiplierValue.textContent = Math.floor(state.manualMultiplier);
        
        if (dom.multiplierStatus) {
            const maxMult = CONFIG.manualMultiplierMax || 32;
            const interval = CONFIG.manualMultiplierIntervalSeconds || 15;
            
            if (state.clickHeat >= 90) {
                if (state.manualMultiplier >= maxMult) {
                    state.manualMultiplier = maxMult;
                    if (dom.multiplierStatusText) dom.multiplierStatusText.textContent = "MAX";
                    if (dom.multiplierStatusText) dom.multiplierStatusText.style.display = 'block';
                    if (dom.multiplierBarContainer) dom.multiplierBarContainer.style.display = 'none';
                    dom.multiplierStatus.classList.add('max-reached');

                    // Track MAX multiplier achievements
                    if (!state.atMaxMultiplier) {
                        state.atMaxMultiplier = true;
                        state.maxMultiplierReachedCount = (state.maxMultiplierReachedCount || 0) + 1;
                        state.currentMaxMultiplierRowStartTime = Date.now();
                    }
                    state.totalMaxMultiplierTime = (state.totalMaxMultiplierTime || 0) + dt;
                } else {
                    state.atMaxMultiplier = false;
                    state.currentMaxMultiplierRowStartTime = null;

                    if (dom.multiplierStatusText) dom.multiplierStatusText.style.display = 'none';
                    if (dom.multiplierBarContainer) dom.multiplierBarContainer.style.display = 'flex';
                    
                    const progress = (state.timeAtTopHeat % interval) / interval;
                    if (dom.multiplierBarFill) {
                        dom.multiplierBarFill.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
                    }
                    if (dom.multiplierBarLeft) dom.multiplierBarLeft.textContent = state.manualMultiplier;
                    if (dom.multiplierBarRight) dom.multiplierBarRight.textContent = Math.min(maxMult, state.manualMultiplier * 2);
                    dom.multiplierStatus.classList.remove('max-reached');
                }
            } else {
                state.atMaxMultiplier = false;
                state.currentMaxMultiplierRowStartTime = null;
                dom.multiplierStatus.classList.remove('max-reached');
                if (dom.multiplierStatusText) {
                    dom.multiplierStatusText.textContent = `Doubles every ${interval} seconds at maximum heat`;
                    dom.multiplierStatusText.style.display = 'block';
                }
                if (dom.multiplierBarContainer) dom.multiplierBarContainer.style.display = 'none';
            }
        }
    }

    // Decay the Click Heat Bar
    // Grace period: don't decay for 250ms after the last click
    const msSinceLastClick = now - lastHeatClickTime;
    if (state.clickHeat > 0 && msSinceLastClick > 250) {
        state.clickHeat = Math.max(0, state.clickHeat - ((CONFIG.heatDecayPerSecond || 15) * dt));
        updateHeatBarUI();
    }

    requestAnimationFrame(gameLoop);
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
        'space/planet_border.png',
        'space/moon_glow.png',
        'space/mars.jpg',
        'space/mars_glow.png',
        'space/jupiter.jpg',
        'space/jupiter glow.png',
        'space/saturn.jpg',
        'space/saturn_glow.png',
        'space/saturn_rings_back.png',
        'space/saturn_rings_front.png',
        'space/uranus.jpg',
        'space/uranus_glow.png',
        'space/neptune.jpg',
        'space/neptune_glow.png',
        'space/rocket.png',
        'space/space-clouds.png',
        // UI assets
        'world_clickers_logo.png',
        'favicon.png',
        // Cursors
        'cursor.png'
    ];

    // Add Achievements (01.png to 50.png)
    for (let i = 1; i <= 50; i++) {
        imagePaths.push(`achievements/${i.toString().padStart(2, '0')}.png`);
    }

    // Add Medals (01.png to 10.png)
    for (let i = 1; i <= 10; i++) {
        imagePaths.push(`medals/${i.toString().padStart(2, '0')}.png`);
    }

    // Add Resources
    CONFIG.resources.forEach(r => imagePaths.push(r.img));
    CONFIG.moonResources.forEach(r => imagePaths.push(r.img));
    CONFIG.marsResources.forEach(r => imagePaths.push(r.img));
    CONFIG.jupiterResources.forEach(r => imagePaths.push(r.img));
    CONFIG.saturnResources.forEach(r => imagePaths.push(r.img));
    CONFIG.uranusResources.forEach(r => imagePaths.push(r.img));
    CONFIG.neptuneResources.forEach(r => imagePaths.push(r.img));

    // Add Tools
    CONFIG.earthTools.forEach(t => imagePaths.push(t.img));
    CONFIG.moonTools.forEach(t => imagePaths.push(t.img));
    CONFIG.marsTools.forEach(t => imagePaths.push(t.img));
    CONFIG.jupiterTools.forEach(t => imagePaths.push(t.img));
    CONFIG.saturnTools.forEach(t => imagePaths.push(t.img));
    CONFIG.uranusTools.forEach(t => imagePaths.push(t.img));
    CONFIG.neptuneTools.forEach(t => imagePaths.push(t.img));

    // 2. Gather ALL audio elements for explicit preloading
    const domAudioElements = [
        document.getElementById('audio-bg-music'),
        document.getElementById('audio-click'),
        document.getElementById('audio-purchase'),
        document.getElementById('audio-award')
    ].filter(el => el !== null);

    // Calculate total assets: images + audio elements + fonts
    const totalAssets = imagePaths.length + domAudioElements.length + 1; // +1 for fonts
    let loadedCount = 0;
    
    console.log(`Preloading ${totalAssets} assets (${imagePaths.length} images, ${domAudioElements.length} sounds, 1 font set)...`);

    const updateProgress = () => {
        loadedCount++;
        const percent = Math.min((loadedCount / totalAssets) * 100, 100);
        if (loadingBar) loadingBar.style.width = `${percent}%`;
    };

    // 5. Finalize
    Promise.all([
        ...imagePaths.map(src => preloadImage(src, updateProgress)), // Pass updateProgress
        ...domAudioElements.map(audio => preloadAudio(audio, updateProgress)), // Pass updateProgress
        document.fonts.ready.then(() => { updateProgress(); })
    ]).then(() => {
        // Transition Loading Bar to Play Button
        if (dom.loadingBarContainer) dom.loadingBarContainer.classList.add('hidden');
        if (dom.btnPlayGame) {
            dom.btnPlayGame.classList.add('enabled');
            dom.btnPlayGame.addEventListener('click', handlePlayClick);
        }

        // Background initialization
        init();
        initCountryFlag();
    });
}

function preloadImage(src, updateProgressCallback) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            imageCache[src] = img;
            updateProgressCallback();
            resolve();
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            updateProgressCallback(); // Count errors too to avoid hanging
            resolve();
        };
    });
}

async function preloadAudio(audio, updateProgressCallback) {
    try {
        const response = await fetch(audio.src);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Use a timeout for the fetch/blob process to avoid hanging
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 60000)
        );
        
        await Promise.race([response.blob(), timeoutPromise]);
        
        // Once downloaded, browser has it in cache
        updateProgressCallback();
    } catch (err) {
        console.warn(`Failed to fully preload audio via fetch: ${audio.src}. Falling back to standard load.`, err);
        // Fallback to standard loading if fetch fails (e.g. CORS or local file)
        return new Promise((resolve) => {
            if (audio.readyState >= 4) {
                updateProgressCallback();
                resolve();
                return;
            }
            const onReady = () => { cleanup(); updateProgressCallback(); resolve(); };
            const onError = () => { cleanup(); updateProgressCallback(); resolve(); };
            const cleanup = () => {
                audio.removeEventListener('canplaythrough', onReady);
                audio.removeEventListener('error', onError);
            };
            audio.addEventListener('canplaythrough', onReady, { once: true });
            audio.addEventListener('error', onError, { once: true });
            audio.load();
            setTimeout(() => { cleanup(); updateProgressCallback(); resolve(); }, 10000);
        });
    }
}

// Global update progress for the helper functions
// This function is no longer needed as updateProgress is passed directly.
// Keeping it as a placeholder if the user intended a different global mechanism.
function updateProgressAcross() {
    // This is a bit of a hack since the original variables are scoped to preloadAssets
    // But we'll just trigger the DOM update if we can find the bar
    const loadingBar = document.getElementById('loading-bar-fill');
    if (loadingBar) {
        // We don't have the exact count here easily without more refactoring, 
        // but since we're almost done, we'll just let the original updateProgress handle it inside the scope if possible.
        // Actually, let's just keep the original structure simpler.
    }
}

async function handlePlayClick() {
    state.gameStarted = true;
    document.body.classList.remove('loading-active');
    document.body.classList.add('game-revealed');

    // Attempt to go fullscreen and lock orientation on mobile
    if (window.matchMedia("(pointer: coarse)").matches) {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }

            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape');
            }
        } catch (err) {
            console.warn("Fullscreen/Orientation lock failed:", err);
        }
    }

    // Fade out loading overlay
    if (dom.loadingOverlay) {
        dom.loadingOverlay.classList.add('loading-fading');
        setTimeout(() => dom.loadingOverlay.classList.add('hidden'), 800);
    }

    if (dom.btnTravel) dom.btnTravel.classList.add('visible');
    initAudio();
    startAutoMine();
    
    // Cooldown will start automatically once first tool is bought in updateChallengeSystem
}

// --- Challenge System ---
let challengeState = {
    active: false,
    resource: null,
    targetCount: 0,
    currentCount: 0,
    prize: 0,
    startTime: 0,
    endTime: 0,
    cooldownEnd: 0,
    tickInterval: null,
    hasUnlocked: false // Track if challenges have ever been unlocked
};

function getEligibleChallengeResources() {
    let eligible = [];
    // Earth: skip first (Wood) and last (Diamond)
    for (let i = 1; i < CONFIG.resources.length - 1; i++) {
        eligible.push({ ...CONFIG.resources[i], planet: 'EARTH', heatZone: i });
    }
    if (state.playerMoonUnlocked) {
        for (let i = 1; i < CONFIG.moonResources.length - 1; i++) {
            eligible.push({ ...CONFIG.moonResources[i], planet: 'MOON', heatZone: i });
        }
    }
    if (state.playerMarsUnlocked) {
        for (let i = 1; i < CONFIG.marsResources.length - 1; i++) {
            eligible.push({ ...CONFIG.marsResources[i], planet: 'MARS', heatZone: i });
        }
    }
    if (state.playerJupiterUnlocked) {
        for (let i = 1; i < CONFIG.jupiterResources.length - 1; i++) {
            eligible.push({ ...CONFIG.jupiterResources[i], planet: 'JUPITER', heatZone: i });
        }
    }
    if (state.playerSaturnUnlocked) {
        for (let i = 1; i < CONFIG.saturnResources.length - 1; i++) {
            eligible.push({ ...CONFIG.saturnResources[i], planet: 'SATURN', heatZone: i });
        }
    }
    if (state.playerUranusUnlocked) {
        for (let i = 1; i < CONFIG.uranusResources.length - 1; i++) {
            eligible.push({ ...CONFIG.uranusResources[i], planet: 'URANUS', heatZone: i });
        }
    }
    if (state.playerNeptuneUnlocked) {
        for (let i = 1; i < CONFIG.neptuneResources.length - 1; i++) {
            eligible.push({ ...CONFIG.neptuneResources[i], planet: 'NEPTUNE', heatZone: i });
        }
    }
    return eligible;
}

function initChallengeSystem() {
    const container = document.getElementById('challenge-container');
    if (!container) return;
    
    // Don't set cooldownEnd here — it gets set in handlePlayClick after PLAY is pressed
    challengeState.tickInterval = setInterval(updateChallengeSystem, 100);
    updateChallengeUI();
}

function startChallenge() {
    const eligible = getEligibleChallengeResources();
    if (eligible.length === 0) return;
    
    const targetCount = 50;
    const resource = eligible[Math.floor(Math.random() * eligible.length)];
    
    // Prize Logic: Prize = autoMinePower * Multiplier * Target
    // The final result is rounded to the nearest ten.
    const autoMinePower = calculateAutoMinePower();
    const multiplier = CONFIG.challengePrizeMultiplier || 0.25;
    const rawPrize = autoMinePower * multiplier * targetCount;
    const prize = Math.round(rawPrize / 10) * 10;
    
    challengeState.active = true;
    challengeState.resource = resource;
    challengeState.targetCount = targetCount;
    challengeState.currentCount = 0;
    challengeState.prize = prize;
    challengeState.startTime = Date.now();
    challengeState.endTime = Date.now() + (CONFIG.challengeDurationSeconds || 60) * 1000;
    
    updateChallengeUI();
}

function updateChallengeSystem() {
    if (!state.gameStarted) return;
    
    const now = Date.now();
    const autoMinePower = calculateAutoMinePower();

    // Challenge Locking Logic:
    // If no mining power, challenges are locked.
    if (autoMinePower === 0) {
        challengeState.active = false;
        challengeState.hasUnlocked = false;
        challengeState.cooldownEnd = 0;
        updateChallengeUI();
        return;
    }

    // If power > 0 and not yet "unlocked" during this session/moment, trigger first cooldown
    if (autoMinePower > 0 && !challengeState.hasUnlocked) {
        challengeState.hasUnlocked = true;
        challengeState.cooldownEnd = now + (CONFIG.challengeCooldownSeconds || 120) * 1000;
        updateChallengeUI();
        return;
    }
    
    if (challengeState.active) {
        // Update timer bar
        const elapsed = now - challengeState.startTime;
        const total = challengeState.endTime - challengeState.startTime;
        const remaining = Math.max(0, 1 - (elapsed / total));
        const timerFill = document.getElementById('challenge-timer-fill');
        if (timerFill) {
            timerFill.style.clipPath = `inset(0 ${(1 - remaining) * 100}% 0 0)`;
        }
        
        // Check expired
        if (now >= challengeState.endTime) {
            failChallenge();
        }
    } else {
        // Cooldown
        if (now >= challengeState.cooldownEnd) {
            startChallenge();
        } else {
            const remainSec = Math.ceil((challengeState.cooldownEnd - now) / 1000);
            const mins = Math.floor(remainSec / 60);
            const secs = remainSec % 60;
            const el = document.getElementById('challenge-countdown');
            if (el) el.textContent = mins + ':' + secs.toString().padStart(2, '0');
        }
    }
}

function checkChallengeMine(resource) {
    if (!challengeState.active) return;
    
    // Must be on the correct planet
    if (state.location !== challengeState.resource.planet) {
        challengeState.currentCount = 0;
        updateChallengeProgress();
        return;
    }
    
    if (resource.name === challengeState.resource.name) {
        challengeState.currentCount++;
        updateChallengeProgress();
        
        if (challengeState.currentCount >= challengeState.targetCount) {
            completeChallenge();
        }
    } else {
        // Wrong resource — reset counter
        challengeState.currentCount = 0;
        updateChallengeProgress();
    }
}

function updateChallengeProgress() {
    const el = document.getElementById('challenge-progress-text');
    if (el) el.textContent = challengeState.currentCount + ' / ' + challengeState.targetCount;
}

function completeChallenge() {
    challengeState.active = false;
    
    // Tracking Stats
    state.challengesCompleted++;
    state.totalChallengeRewards += challengeState.prize;
    
    const timeTaken = (Date.now() - challengeState.startTime) / 1000;
    if (state.fastestChallengeTime === null || timeTaken < state.fastestChallengeTime) {
        state.fastestChallengeTime = timeTaken;
    }

    // Award prize
    state.playerScore += challengeState.prize;
    state.score += challengeState.prize;
    state.totalEarned += challengeState.prize;
    
    // Play purchase sound
    if (state.audioEnabled && dom.audioPurchase) {
        const audio = dom.audioPurchase.cloneNode();
        audio.volume = state.soundVolume / 100;
        audio.play().catch(() => {});
    }
    
    // Green flash on score
    if (dom.playerScoreDisplay) {
        dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
        dom.playerScoreDisplay.classList.remove('challenge-won-flash');
        void dom.playerScoreDisplay.offsetWidth;
        dom.playerScoreDisplay.classList.add('challenge-won-flash');
        setTimeout(() => dom.playerScoreDisplay.classList.remove('challenge-won-flash'), 2500);
    }
    
    saveLocalState();
    updateToolLockedStates();
    
    // Start cooldown
    challengeState.cooldownEnd = Date.now() + (CONFIG.challengeCooldownSeconds || 120) * 1000;
    updateChallengeUI();
}

function failChallenge() {
    challengeState.active = false;
    state.challengesFailed++;
    challengeState.cooldownEnd = Date.now() + (CONFIG.challengeCooldownSeconds || 120) * 1000;
    saveLocalState();
    updateChallengeUI();
}

function updateChallengeUI() {
    const cardEl = document.getElementById('challenge-card');
    const waitingEl = document.getElementById('challenge-waiting');
    const lockedEl = document.getElementById('challenge-locked');
    
    const autoMinePower = calculateAutoMinePower();

    // 1. Locked State (No tools)
    if (autoMinePower === 0) {
        if (cardEl) cardEl.style.display = 'none';
        if (waitingEl) waitingEl.style.display = 'none';
        if (lockedEl) lockedEl.style.display = '';
        return;
    }

    // 2. Active or Waiting states
    lockedEl.style.display = 'none';

    if (challengeState.active) {
        if (cardEl) cardEl.style.display = '';
        if (waitingEl) waitingEl.style.display = 'none';
        
        const countEl = document.getElementById('challenge-count');
        const imgEl = document.getElementById('challenge-img');
        const prizeEl = document.getElementById('challenge-prize-value');
        
        if (countEl) countEl.textContent = challengeState.targetCount;
        if (imgEl) imgEl.src = challengeState.resource.img;
        if (prizeEl) prizeEl.innerHTML = '$' + (window.formatShortNumber ? window.formatShortNumber(challengeState.prize) : challengeState.prize);
        
        // Update planet prefix
        const CHALLENGE_PLANET_PREFIX = {
            'EARTH': 'On Earth,',
            'MOON': 'On the moon,',
            'MARS': 'On Mars,',
            'JUPITER': 'On Jupiter,',
            'SATURN': 'On Saturn,',
            'URANUS': 'On Uranus,',
            'NEPTUNE': 'On Neptune,'
        };
        if (dom.challengePrefix) {
            dom.challengePrefix.textContent = CHALLENGE_PLANET_PREFIX[challengeState.resource.planet] || '';
        }
        
        updateChallengeProgress();
        
        // Reset timer bar to full
        const timerFill = document.getElementById('challenge-timer-fill');
        if (timerFill) timerFill.style.width = '100%';
    } else {
        if (cardEl) cardEl.style.display = 'none';
        if (waitingEl) waitingEl.style.display = '';
    }
}

// --- Custom Cursor Logic (Edge Fix) ---
(function () {
    // Only run on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.backgroundImage = "url('cursor.png')";
        cursor.style.width = 'calc(32px * var(--s))';
        cursor.style.height = 'calc(32px * var(--s))';

        const computedCursor = window.getComputedStyle(e.target).cursor;
        const isClickable = (e.target.closest('i, button, a, .menu-item, .tab-btn') && 
                             computedCursor !== 'default' && computedCursor !== 'none') ||
            computedCursor === 'pointer';

        if (isClickable) {
            cursor.style.transform = "scale(1.1) translateZ(calc(9999px * var(--s)))";
        } else {
            cursor.style.transform = "translateZ(calc(9999px * var(--s)))";
        }
    });

    document.addEventListener('mouseleave', () => cursor.style.display = 'none');
    document.addEventListener('mouseenter', () => cursor.style.display = 'block');
})();

// Run
window.addEventListener('DOMContentLoaded', preloadAssets);

// --- Responsive App Scaling ---
function resizeApp() {
    const isGamePage = !!document.querySelector('.game-wrapper');
    if (!isGamePage) {
        // For standalone pages (login, profile), use fixed scale or 1
        document.documentElement.style.setProperty('--s', 1);
        return;
    }

    let scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--s', scale);
}

window.addEventListener('resize', resizeApp);
window.addEventListener('DOMContentLoaded', () => {
    resizeApp();
    document.body.classList.add('loading-active');
});
resizeApp();

/**
 * Triggers a subtle pulse animation on the score boardroom
 */
function triggerScorePopup() {
    if (!dom.playerScoreDisplay) return;
    dom.playerScoreDisplay.classList.remove('score-popup-anim');
    void dom.playerScoreDisplay.offsetWidth;
    dom.playerScoreDisplay.classList.add('score-popup-anim');
}

/**
 * Displays a temporary unlock notification in the header.
 * @param {string} type - 'achievement' or 'medal'
 * @param {number} id - The ID of the unlocked item
 */
let notificationQueue = [];
let isProcessingQueue = false;

/**
 * Queues a temporary unlock notification in the header.
 * @param {string} type - 'achievement' or 'medal'
 * @param {number} id - The ID of the unlocked item
 */
function showUnlockNotification(type, id) {
    notificationQueue.push({ type, id });
    if (!isProcessingQueue) {
        processNotificationQueue();
    }
}

/**
 * Processes the notification queue sequentially.
 */
function processNotificationQueue() {
    if (notificationQueue.length === 0) {
        isProcessingQueue = false;
        // All notifications finished - Trigger Award Icon Highlight (2s)
        if (dom.btnAwards) {
            dom.btnAwards.classList.add('award-unlock-active');
            setTimeout(() => {
                dom.btnAwards.classList.remove('award-unlock-active');
            }, 1000);
        }
        return;
    }

    isProcessingQueue = true;
    const { type, id } = notificationQueue.shift();

    if (!dom.unlockNotification || !dom.topNavIcons) {
        processNotificationQueue();
        return;
    }

    // Play Award Sound
    if (state.audioEnabled && dom.audioAward) {
        const sound = dom.audioAward.cloneNode();
        sound.volume = state.soundVolume / 100;
        sound.play().catch(() => { });
    }

    const isMedal = type === 'medal';
    const displayTime = isMedal ? 4000 : 7000;
    const title = isMedal ? 'New Medal Unlocked!' : 'New Achievement Unlocked!';
    const imgNum = id.toString().padStart(2, '0');
    const imgSrc = isMedal ? `medals/${imgNum}.png` : `achievements/${imgNum}.png`;

    // Populate Notification content
    if (isMedal) {
        // Keep original layout for medals
        dom.unlockNotification.innerHTML = `
            <img src="${imgSrc}" alt="${type}">
            <span>${title}</span>
        `;
    } else {
        // Multi-line layout for achievements
        const achievementName = ACHIEVEMENT_NAMES[id - 1] || `Achievement ${id}`;
        dom.unlockNotification.innerHTML = `
            <img src="${imgSrc}" alt="${type}">
            <div class="unlock-notification-text">
                <div class="unlock-notification-title">${title}</div>
                <div class="unlock-notification-subtitle">${achievementName}</div>
            </div>
        `;
    }

    // Step 1: Show Notification, Hide Icons
    dom.topNavIcons.classList.add('hidden');
    dom.unlockNotification.classList.remove('hidden');

    setTimeout(() => {
        if (notificationQueue.length > 0) {
            // Next message immediately
            processNotificationQueue();
        } else {
            // All messages done: Hide notification, show icons
            dom.unlockNotification.classList.add('hidden');
            dom.topNavIcons.classList.remove('hidden');
            
            // Trigger Award Icon Highlight (1s) - handled by the empty queue check in next call
            processNotificationQueue();
        }
    }, displayTime);
}
