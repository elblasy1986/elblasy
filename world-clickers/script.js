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
    musicVolume: 100,
    soundVolume: 100,
    gameStarted: false,
    location: 'EARTH', // 'EARTH', 'MOON', or 'MARS'
    isTravelling: false,
    country: null, // Player's country info { code, name }
    playerMoonUnlocked: localStorage.getItem('worldClickerPlayerMoonUnlocked') === 'true',
    playerMarsUnlocked: localStorage.getItem('worldClickerPlayerMarsUnlocked') === 'true',
    unlockedResources: ['WOOD'], // Start with wood
    unlockedMoonResources: ['REGOLITH DUST'], // Start with dust
    unlockedMarsResources: ['REDSTONE'], // Start with redstone
    ownedTools: {}, // Track quantities { tool_id: count }
    revealedTools: {}, // Track tools revealed (seen) by the player { tool_id: true }
    clickHeat: 0, // Track clicking speed (0 to 100)
    totalEarned: 0,
    totalSpent: 0,
    totalClicks: 0,
    timePlayedSeconds: 0,
    manualMultiplier: 1,
    timeAtTopHeat: 0,
    multiplierDecayAccumulator: 0
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

    // Interact Zones
    earthZone: document.getElementById('earth-interact-zone'),
    moonZone: document.getElementById('moon-interact-zone'),
    marsZone: document.getElementById('mars-interact-zone'),

    // Audio
    audioBg: document.getElementById('audio-bg-music'),
    audioClick: document.getElementById('audio-click'),
    audioPurchase: document.getElementById('audio-purchase'),

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

    // Heat Bar
    heatBarFill: document.getElementById('heat-bar-fill'),

    // New Loading/Play
    btnPlayGame: document.getElementById('btn-play-game'),
    loadingBarContainer: document.getElementById('loading-bar-container'),
    loadingOverlay: document.getElementById('loading-overlay'),
    multiplierValue: document.getElementById('multiplier-value'),
    multiplierStatus: document.getElementById('multiplier-status-line')
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

function openStats() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;

    const elTime = document.getElementById('stat-time-played');
    const elEarned = document.getElementById('stat-total-earned');
    const elSpent = document.getElementById('stat-total-spent');
    const elClicks = document.getElementById('stat-total-clicks');

    if (elTime) elTime.textContent = formatTime(state.timePlayedSeconds);
    if (elEarned) elEarned.textContent = '$' + Math.floor(state.totalEarned).toLocaleString();
    if (elSpent) elSpent.textContent = '$' + Math.floor(state.totalSpent).toLocaleString();
    if (elClicks) elClicks.textContent = state.totalClicks.toLocaleString();

    overlay.classList.remove('hidden');
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
        eraseBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Erase All Data';
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
        eraseBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Click again to confirm';
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
    if (state.location === 'MARS') return CONFIG.marsResources;
    if (state.location === 'MOON') return CONFIG.moonResources;
    return CONFIG.resources;
}

function getToolsForLocation(loc) {
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
        const isMoonTool = CONFIG.moonTools.some(t => t.id === tool.id);
        const isMarsTool = CONFIG.marsTools.some(t => t.id === tool.id);
        let index, resourceObj;
        if (isEarthTool) {
            index = CONFIG.earthTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.resources[index];
        } else if (isMoonTool) {
            index = CONFIG.moonTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.moonResources[index];
        } else {
            index = CONFIG.marsTools.findIndex(t => t.id === tool.id);
            resourceObj = CONFIG.marsResources[index];
        }
        const resImg = resourceObj ? resourceObj.img : '';
        const resVal = resourceObj ? resourceObj.value : 0;
        const totalValue = resVal * tool.val;
        const totalValueStr = window.formatShortNumber ? window.formatShortNumber(totalValue) : totalValue;

        item.innerHTML = `
            <img src="${tool.img}" alt="${tool.name}">
            <div class="shop-name-display" id="name-${tool.id}">${tool.name}${ownedSuffix}</div>
            <div class="shop-desc" style="line-height: 1.25; margin-top: 0px; font-size: 1rem;">
                Mines ${window.formatShortNumber(tool.val)} &times; <img src="${resImg}" alt="${tool.res}" style="height: calc(35px * var(--s)); width: auto; vertical-align: middle; margin: 0 calc(2px * var(--s));"> per second.<br>
                <div style="color: #ffd700; font-family: 'Lilita One', cursive; margin-top: calc(2px * var(--s)); font-size: 1.2rem;">Adds $${totalValueStr} per second.</div>
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
                const isEarth = CONFIG.earthTools.some(t => t.id === tool.id);
                const isMars = CONFIG.marsTools.some(t => t.id === tool.id);
                if (isEarth) {
                    if (!state.unlockedResources.includes(resName)) state.unlockedResources.push(resName);
                } else if (isMars) {
                    if (!state.unlockedMarsResources.includes(resName)) state.unlockedMarsResources.push(resName);
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
    const allTools = [...CONFIG.earthTools, ...CONFIG.moonTools, ...CONFIG.marsTools];
    allTools.forEach(tool => {
        const nameDisplay = document.getElementById(`name-${tool.id}`);
        if (!nameDisplay) return;

        const shopItem = nameDisplay.closest('.shop-item');
        const owned = state.ownedTools[tool.id] || 0;
        const ownedSuffix = owned > 0 ? ` × ${owned}` : '';
        const currentPrice = getToolCurrentPrice(tool);
        const isMoonTool = CONFIG.moonTools.some(t => t.id === tool.id);
        const isMarsTool = CONFIG.marsTools.some(t => t.id === tool.id);

        if ((state.playerScore >= currentPrice || owned > 0) && (!isMoonTool || state.playerMoonUnlocked) && (!isMarsTool || state.playerMarsUnlocked)) {
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

    if (!listEarth || !listMoon || !listMars) return;

    listEarth.classList.add('hidden');
    listMoon.classList.add('hidden');
    listMars.classList.add('hidden');

    if (state.location === 'EARTH') {
        listEarth.classList.remove('hidden');
    } else if (state.location === 'MOON') {
        listMoon.classList.remove('hidden');
    } else {
        listMars.classList.remove('hidden');
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
        { id: 'MOON', name: 'Moon', preview: 'moon-preview', unlocked: state.playerMoonUnlocked, cost: CONFIG.moonUnlockCost },
        { id: 'MARS', name: 'Mars', preview: 'mars-preview', unlocked: state.playerMarsUnlocked, cost: CONFIG.marsUnlockCost }
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

function handlePlanetSelect(planet) {
    // If not unlocked, pay the cost
    if (!planet.unlocked) {
        if (state.playerScore < planet.cost) return;

        state.playerScore = Math.max(0, state.playerScore - planet.cost);
        state.totalSpent += planet.cost;
        if (dom.playerScoreDisplay) dom.playerScoreDisplay.innerHTML = '$' + window.formatShortNumber(state.playerScore);

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
    const allLocations = ['EARTH', 'MOON', 'MARS'];

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

    updateShopView();
    updateResourceIcons();

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
    state.playerScore += multipliedValue; // Increment individual score
    state.score += multipliedValue;       // Increment total group score
    state.totalEarned += multipliedValue;

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
    const autoMinePower = calculateAutoMinePower();
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
}

function calculateAutoMinePower() {
    let power = 0;
    const allTools = [...CONFIG.earthTools, ...CONFIG.moonTools, ...CONFIG.marsTools];
    allTools.forEach(tool => {
        const owned = state.ownedTools[tool.id] || 0;
        if (owned > 0) {
            const resName = tool.res.toUpperCase();
            const resVal = [...CONFIG.resources, ...CONFIG.moonResources, ...CONFIG.marsResources].find(r => r.name === resName)?.value || 1;
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

    const storedEarned = localStorage.getItem('worldClickerTotalEarned');
    if (storedEarned) state.totalEarned = parseFloat(storedEarned);

    const storedSpent = localStorage.getItem('worldClickerTotalSpent');
    if (storedSpent) state.totalSpent = parseFloat(storedSpent);

    const storedClicks = localStorage.getItem('worldClickerTotalClicks');
    if (storedClicks) state.totalClicks = parseInt(storedClicks, 10);

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
        const marsTool = CONFIG.marsTools.find(t => t.id === toolId);
        if (marsTool && !state.unlockedMarsResources.includes(marsTool.res.toUpperCase())) {
            state.unlockedMarsResources.push(marsTool.res.toUpperCase());
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

    // Start background loops
    gameLoop();
    
    // Init shop arrow scrolling
    initShopScrolling();
    
    // Init challenge system
    initChallengeSystem();

    // Enforce fullscreen on mobile
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
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

    if (state.gameStarted) {
        state.timePlayedSeconds += dt;

        // Manual Mining Multiplier Logic
        if (state.clickHeat >= 90) {
            state.timeAtTopHeat += dt;
            const maxMult = CONFIG.manualMultiplierMax || 32;
            const interval = CONFIG.manualMultiplierIntervalSeconds || 15;
            const intervals = Math.floor(state.timeAtTopHeat / interval);
            const newMult = Math.min(maxMult, Math.pow(2, intervals));
            
            if (newMult > state.manualMultiplier) {
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
            if (state.manualMultiplier >= maxMult) {
                dom.multiplierStatus.textContent = "MAX";
                dom.multiplierStatus.classList.add('max-reached');
            } else {
                const interval = CONFIG.manualMultiplierIntervalSeconds || 15;
                dom.multiplierStatus.textContent = `Doubles every ${interval} seconds at maximum heat`;
                dom.multiplierStatus.classList.remove('max-reached');
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
        'space/moon_mars_border.png',
        'space/moon_glow.png',
        'space/mars.jpg',
        'space/mars_glow.png',
        'space/rocket.png',
        'space/space-clouds.png',
        // UI assets
        'world_clickers_logo.png',
        // Cursors
        'cursor.png'
    ];

    // Add Resources
    CONFIG.resources.forEach(r => imagePaths.push(r.img));
    CONFIG.moonResources.forEach(r => imagePaths.push(r.img));
    CONFIG.marsResources.forEach(r => imagePaths.push(r.img));

    // Add Tools
    CONFIG.earthTools.forEach(t => imagePaths.push(t.img));
    CONFIG.moonTools.forEach(t => imagePaths.push(t.img));
    CONFIG.marsTools.forEach(t => imagePaths.push(t.img));

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
    
    const counts = [25, 50, 75, 100];
    const targetCount = counts[Math.floor(Math.random() * counts.length)];
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
        if (timerFill) timerFill.style.width = (remaining * 100) + '%';
        
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
    challengeState.cooldownEnd = Date.now() + (CONFIG.challengeCooldownSeconds || 120) * 1000;
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
        
        updateChallengeProgress();
        
        // Reset timer bar to full
        const timerFill = document.getElementById('challenge-timer-fill');
        if (timerFill) timerFill.style.width = '100%';
    } else {
        if (cardEl) cardEl.style.display = 'none';
        if (waitingEl) waitingEl.style.display = '';
    }
}

// --- Shop Arrow Scrolling ---
function initShopScrolling() {
    const btnUp = document.getElementById('btn-shop-up');
    const btnDown = document.getElementById('btn-shop-down');
    const viewport = document.getElementById('shop-list-viewport');

    if (!btnUp || !btnDown || !viewport) return;

    function getScrollStep() {
        const activeList = viewport.querySelector('.shop-list:not(.hidden)');
        if (!activeList) return 150;
        const firstItem = activeList.querySelector('.shop-item');
        if (!firstItem) return 150;
        const scaleS = parseFloat(document.documentElement.style.getPropertyValue('--s')) || 1;
        const gap = 10 * scaleS;
        return (firstItem.offsetHeight + gap) * 2;
    }

    btnUp.addEventListener('click', () => {
        viewport.scrollBy({ top: -getScrollStep(), behavior: 'smooth' });
    });

    btnDown.addEventListener('click', () => {
        viewport.scrollBy({ top: getScrollStep(), behavior: 'smooth' });
    });

    function updateButtons() {
        if (viewport.scrollTop <= 2) {
            btnUp.classList.add('disabled');
        } else {
            btnUp.classList.remove('disabled');
        }
        if (Math.ceil(viewport.scrollTop + viewport.clientHeight) >= viewport.scrollHeight - 2) {
            btnDown.classList.add('disabled');
        } else {
            btnDown.classList.remove('disabled');
        }
    }

    viewport.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', () => setTimeout(updateButtons, 100));

    // Reset scroll on planet switch (shop-list hidden class change)
    const observer = new MutationObserver(() => {
        viewport.scrollTop = 0;
        setTimeout(updateButtons, 50);
    });
    Array.from(viewport.querySelectorAll('.shop-list')).forEach(list => {
        observer.observe(list, { attributes: true, attributeFilter: ['class'] });
    });

    setTimeout(updateButtons, 300);
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
