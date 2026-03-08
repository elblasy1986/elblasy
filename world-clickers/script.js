/**
 * World Clicker - Main Game Logic
 */

// --- Configuration ---
// --- Configuration ---
// All game settings, prices, and metadata are loaded from the external config.js file.
// If you want to change game balance, edit config.js.
const CONFIG = {
    ...GAME_CONFIG,
    // Add any internal-only logic config here if needed
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
    country: null, // Player's country info { code, name }
    playerMoonUnlocked: localStorage.getItem('worldClickerPlayerMoonUnlocked') === 'true',
    unlockedResources: ['WOOD'], // Start with wood
    unlockedMoonResources: ['REGOLITH DUST'], // Start with dust
    ownedTools: {}, // Track quantities { tool_id: count }
    revealedTools: {}, // Track tools revealed (seen) by the player { tool_id: true }
    clickHeat: 0 // Track clicking speed (0 to 100)
};

// --- Score Management ---
function saveLocalState() {
    localStorage.setItem('worldClickerScore', state.score);
    localStorage.setItem('worldClickerPlayerScore', state.playerScore);
    localStorage.setItem('worldClickerOwnedTools', JSON.stringify(state.ownedTools));
    localStorage.setItem('worldClickerRevealedTools', JSON.stringify(state.revealedTools));
}

let autoMineInterval = null;
state.autoMinePower = 0;

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
    countryFlag: document.getElementById('country-flag'),

    // Shop Lists (for dynamic display)
    shopListEarth: document.getElementById('shop-list-earth'),
    shopListMoon: document.getElementById('shop-list-moon'),

    // Heat Bar
    heatBarFill: document.getElementById('heat-bar-fill'),

    // New Loading/Play
    btnPlayGame: document.getElementById('btn-play-game'),
    loadingBarContainer: document.getElementById('loading-bar-container'),
    loadingOverlay: document.getElementById('loading-overlay')
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


// --- Core Logic ---
// Returns the resource corresponding to the current heat bar level.
// The heat bar (0-100) is divided into 10 equal zones, each mapped to a resource.
// Zone 0 (0-10%): first resource (Wood / Regolith Dust)
// Zone 9 (90-100%): last resource (Diamond / Ethereum Pulse)
function getHeatResource() {
    const isEarth = state.location === 'EARTH';
    const pool = isEarth ? CONFIG.resources : CONFIG.moonResources;

    // Determine which zone the heat is in (0-9)
    // heat 0 = zone 0 (Wood), heat 100 = zone 9 (Diamond)
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
    span.textContent = `+${resource.value}`;

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
        const index = isEarthTool ? CONFIG.earthTools.findIndex(t => t.id === tool.id) : CONFIG.moonTools.findIndex(t => t.id === tool.id);
        const resourceObj = isEarthTool ? CONFIG.resources[index] : CONFIG.moonResources[index];
        const resImg = resourceObj ? resourceObj.img : '';
        const resVal = resourceObj ? resourceObj.value : 0;
        const totalValue = resVal * tool.val;
        const totalValueStr = window.formatShortNumber ? window.formatShortNumber(totalValue) : totalValue;

        item.innerHTML = `
            <img src="${tool.img}" alt="${tool.name}">
            <div class="shop-info">
                <div class="shop-name-display" id="name-${tool.id}">${tool.name}${ownedSuffix}</div>
                <div class="shop-desc" style="line-height: 1.25; margin-top: 0px;">
                    Mines ${tool.val} &times; <img src="${resImg}" alt="${tool.res}" style="height: calc(20px * var(--s)); width: auto; vertical-align: text-bottom; margin: 0 calc(1px * var(--s));"> per second.<br>
                    <div style="color: #ffd700; font-family: 'Lilita One', cursive; margin-top: calc(2px * var(--s));">Adds $${totalValueStr} every single second.</div>
                </div>
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
                audio.volume = 0.5;
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
                state.ownedTools[tool.id] = result.total_owned;

                if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
                nameDisplay.textContent = `${tool.name} × ${state.ownedTools[tool.id]}`;

                // Update price display to show new escalated price
                const priceBtn = item.querySelector(`#price-${tool.id}`);
                if (priceBtn) priceBtn.innerHTML = `$${window.formatShortNumber(getToolCurrentPrice(tool))}`;

                // Update Auto-Mine Power
                calculateAutoMinePower();

                // Unlock Resources
                const isEarth = CONFIG.earthTools.some(t => t.id === tool.id);
                if (isEarth) {
                    if (!state.unlockedResources.includes(resName)) state.unlockedResources.push(resName);
                } else {
                    if (!state.unlockedMoonResources.includes(resName)) state.unlockedMoonResources.push(resName);
                }

                saveLocalState();
                updateToolLockedStates();
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
    const allTools = [...CONFIG.earthTools, ...CONFIG.moonTools];
    allTools.forEach(tool => {
        const nameDisplay = document.getElementById(`name-${tool.id}`);
        if (!nameDisplay) return;

        const shopItem = nameDisplay.closest('.shop-item');
        const owned = state.ownedTools[tool.id] || 0;
        const ownedSuffix = owned > 0 ? ` × ${owned}` : '';
        const currentPrice = getToolCurrentPrice(tool);
        const isMoonTool = CONFIG.moonTools.some(t => t.id === tool.id);

        // Check if player has the points, or has previously owned/revealed it
        // Only allow revealing moon tools if the moon is unlocked
        if ((state.playerScore >= currentPrice || owned > 0) && (!isMoonTool || state.playerMoonUnlocked)) {
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

    if (!listEarth || !listMoon) return;

    if (state.location === 'EARTH') {
        listEarth.classList.remove('hidden');
        listMoon.classList.add('hidden');
    } else {
        listMoon.classList.remove('hidden');
        listEarth.classList.add('hidden');
    }
    updateToolLockedStates();
}

// --- Travel Logic ---
function updateTravelButton() {
    // No text to update - button is now a rocket image
}

function handleTravel() {
    if (state.isTravelling || !state.gameStarted) return;

    if (state.location === 'EARTH') {
        if (state.playerMoonUnlocked) {
            // Player already unlocked the Moon! Fly directly.
            executeAnimation();
        } else {
            // Show confirmation popup to pay the unlock fee
            if (dom.travelConfirmOverlay) {
                dom.travelConfirmOverlay.classList.remove('hidden');

                // Update cost display
                const costDisplay = document.getElementById('travel-cost-value');
                if (costDisplay) costDisplay.innerHTML = '$' + window.formatShortNumber(CONFIG.moonUnlockCost);

                // Enable/disable the pay button based on funds
                const payBtn = document.getElementById('btn-pay-travel');
                if (payBtn) {
                    if (state.playerScore >= CONFIG.moonUnlockCost) {
                        payBtn.classList.remove('disabled');
                    } else {
                        payBtn.classList.add('disabled');
                    }
                }
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
        if (state.playerScore < CONFIG.moonUnlockCost) {
            alert(`Not enough points to travel. Required: ${window.formatShortNumber(CONFIG.moonUnlockCost)}`);
            return;
        }

        // Deduct locally
        state.playerScore = Math.max(0, state.playerScore - CONFIG.moonUnlockCost);
        if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);

        // Play purchase sound
        if (state.audioEnabled && dom.audioPurchase) {
            const sound = dom.audioPurchase.cloneNode();
            sound.volume = 0.5;
            sound.play().catch(() => { });
        }

        state.playerMoonUnlocked = true;
        saveLocalState();
        localStorage.setItem('worldClickerPlayerMoonUnlocked', 'true');
        updateToolLockedStates();
    }

    executeAnimation();
}


function updateResourceIcons() {
    const iconsColumn = document.querySelector('.resources-icons-column');
    const namesColumn = document.querySelector('.resources-names-column');
    if (!iconsColumn) return;

    const isEarth = state.location === 'EARTH';
    const pool = isEarth ? CONFIG.resources : CONFIG.moonResources;

    // Pool is ordered from index 0 (lowest value) to 9 (highest value)
    // Icons in DOM are top-to-bottom, so highest value (index 9) first
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

    // Refresh icon highlighting
    updateHeatBarUI();
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

    updateShopView(); // Swap shop tools based on location
    updateResourceIcons(); // Swap sidebar resource icons

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

    // --- Heat Bar Logic ---
    // Increase heat on click, max 100 (only after game started)
    state.clickHeat = Math.min(100, state.clickHeat + 1);
    lastHeatClickTime = performance.now();
    updateHeatBarUI();

    if (state.audioEnabled && dom.audioClick) {
        const sound = dom.audioClick.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(() => { });
    }

    const resource = getHeatResource();
    state.playerScore += resource.value; // Increment individual score
    state.score += resource.value;       // Increment total group score

    // Update UI
    if (dom.playerScoreDisplay) {
        dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
        triggerScorePopup();
    }
    if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);

    // Update shop silhouettes dynamically
    updateToolLockedStates();

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

    saveLocalState();

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

// Update displayed player score every 1 second (auto-mine tick)
function tickPlayerScore() {
    // Auto Mining Logic
    const autoMinePower = calculateAutoMinePower();
    if (autoMinePower > 0) {
        state.playerScore += autoMinePower;
        state.score += autoMinePower;

        if (dom.playerScoreDisplay) {
            dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);
            triggerScorePopup();
        }
        if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);

        saveLocalState();
        updateToolLockedStates();
    }
}

function calculateAutoMinePower() {
    let power = 0;
    const allTools = [...CONFIG.earthTools, ...CONFIG.moonTools];
    allTools.forEach(tool => {
        const owned = state.ownedTools[tool.id] || 0;
        if (owned > 0) {
            const resName = tool.res.toUpperCase();
            const resVal = [...CONFIG.resources, ...CONFIG.moonResources].find(r => r.name === resName)?.value || 1;
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

    // Load Score from localStorage first (instant display)
    const savedScore = localStorage.getItem('worldClickerScore');
    const savedPlayerScore = localStorage.getItem('worldClickerPlayerScore');

    if (savedScore) {
        state.score = parseInt(savedScore, 10) || 0;
        if (dom.scoreDisplay) dom.scoreDisplay.innerHTML = window.formatShortNumber(state.score);
    }

    // --- Local Load Logic ---
    const storedScore = localStorage.getItem('worldClickerScore');
    if (storedScore) state.score = parseInt(storedScore, 10);

    const storedPlayerScore = localStorage.getItem('worldClickerPlayerScore');
    if (storedPlayerScore) state.playerScore = parseInt(storedPlayerScore, 10);

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

    const revealed = localStorage.getItem('worldClickerRevealedTools');
    if (revealed) {
        try {
            state.revealedTools = JSON.parse(revealed);
        } catch (e) { }
    }

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
    updateShopView();

    // Start Local Autominers
    startAutoMine();

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
    // --- Global Controls ---

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

    document.addEventListener('contextmenu', e => e.preventDefault());

    // Start background loops
    gameLoop();
}

// ── Custom Scrollbar (cross-browser, fixed overlay) ──
function initCustomScrollbar(scrollEl) {
    if (!scrollEl) return;

    // Create track + thumb, append to body so they overlay without affecting layout
    const track = document.createElement('div');
    track.className = 'custom-scrollbar-track';
    const thumb = document.createElement('div');
    thumb.className = 'custom-scrollbar-thumb';
    track.appendChild(thumb);
    document.body.appendChild(track);

    let rafId = null;

    function syncPosition() {
        const rect = scrollEl.getBoundingClientRect();
        const { scrollTop, scrollHeight, clientHeight } = scrollEl;

        // Hide if no overflow
        if (scrollHeight <= clientHeight) {
            track.style.display = 'none';
            return;
        }
        track.style.display = 'block';

        // Position the track over the scrollEl's right edge
        const inset = 10; // top/bottom padding for the track
        track.style.top = (rect.top + inset) + 'px';
        track.style.left = (rect.right - 18) + 'px'; // 18px from right edge
        track.style.height = (rect.height - inset * 2) + 'px';

        // Calculate thumb
        const trackH = rect.height - inset * 2;
        const ratio = clientHeight / scrollHeight;
        const thumbH = Math.max(40, ratio * trackH);
        const maxThumbTop = trackH - thumbH;
        const scrollFraction = scrollTop / (scrollHeight - clientHeight);

        thumb.style.height = thumbH + 'px';
        thumb.style.top = (scrollFraction * maxThumbTop) + 'px';
    }

    // Keep synced via rAF loop (handles resize, scroll, DOM changes)
    function loop() {
        syncPosition();
        rafId = requestAnimationFrame(loop);
    }
    loop();

    // Drag support
    let dragging = false, startY = 0, startScrollTop = 0;

    thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        startY = e.clientY;
        startScrollTop = scrollEl.scrollTop;
        thumb.classList.add('dragging');
        document.body.style.userSelect = 'none';
    });

    thumb.addEventListener('touchstart', (e) => {
        dragging = true;
        startY = e.touches[0].clientY;
        startScrollTop = scrollEl.scrollTop;
        thumb.classList.add('dragging');
    }, { passive: true });

    function onMove(clientY) {
        if (!dragging) return;
        const rect = scrollEl.getBoundingClientRect();
        const { scrollHeight, clientHeight } = scrollEl;
        const inset = 10;
        const trackH = rect.height - inset * 2;
        const ratio = clientHeight / scrollHeight;
        const thumbH = Math.max(40, ratio * trackH);
        const maxThumbTop = trackH - thumbH;
        const scrollRange = scrollHeight - clientHeight;
        const dy = clientY - startY;
        scrollEl.scrollTop = startScrollTop + (dy / maxThumbTop) * scrollRange;
    }

    document.addEventListener('mousemove', (e) => onMove(e.clientY));
    document.addEventListener('touchmove', (e) => { if (dragging) onMove(e.touches[0].clientY); }, { passive: true });

    function onUp() {
        if (!dragging) return;
        dragging = false;
        thumb.classList.remove('dragging');
        document.body.style.userSelect = '';
    }
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);

    // Click on track to jump
    track.addEventListener('mousedown', (e) => {
        if (e.target === thumb) return;
        e.preventDefault();
        const rect = track.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const trackH = rect.height;
        const { scrollHeight, clientHeight } = scrollEl;
        const fraction = clickY / trackH;
        scrollEl.scrollTop = fraction * (scrollHeight - clientHeight);
    });
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
}

let lastFrameTime = performance.now();

// --- Main Game Loop (for passive visual logic) ---
function gameLoop() {
    const now = performance.now();
    const dt = (now - lastFrameTime) / 1000; // Delta time in seconds
    lastFrameTime = now;

    // Decay the Click Heat Bar (~15 heat per second)
    // Grace period: don't decay for 250ms after the last click
    const msSinceLastClick = now - lastHeatClickTime;
    if (state.clickHeat > 0 && msSinceLastClick > 250) {
        state.clickHeat = Math.max(0, state.clickHeat - (15 * dt));
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
        'space/moon_border.png',
        'space/moon_glow.png',
        'space/rocket.png',
        'space/space-clouds.png',
        // UI assets
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

function preloadAudio(audio, updateProgressCallback) {
    return new Promise((resolve) => {
        if (audio.readyState >= 4) { // HAVE_ENOUGH_DATA
            updateProgressCallback();
            resolve();
            return;
        }
        let resolved = false;
        const onReady = () => { if (!resolved) { resolved = true; cleanup(); updateProgressCallback(); resolve(); } };
        const onError = () => { if (!resolved) { resolved = true; cleanup(); console.warn(`Failed to load audio: ${audio.src}`); updateProgressCallback(); resolve(); } };
        const cleanup = () => {
            audio.removeEventListener('canplaythrough', onReady);
            audio.removeEventListener('error', onError);
        };
        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        audio.load();
        setTimeout(() => { if (!resolved) { resolved = true; cleanup(); console.log(`Audio timeout reached for: ${audio.src}`); updateProgressCallback(); resolve(); } }, 5000);
    });
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

        const isClickable = e.target.closest('i, button, a, .menu-item, .tab-btn') ||
            window.getComputedStyle(e.target).cursor === 'pointer';

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
    const gameWrapper = document.querySelector('.game-wrapper');
    if (!gameWrapper) {
        document.documentElement.style.setProperty('--s', 1);
        return;
    }

    let scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    if (scale > 2.5) scale = 2.5;
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
