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
        { name: 'LUNAR ICE', rarity: 15, value: 50, img: 'resources/lunar_ice.png' },
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

// --- Game State ---
let state = {
    score: 0,
    lastClickTime: 0,
    musicEnabled: true,
    audioEnabled: true,
    gameStarted: false,
    location: 'EARTH', // 'EARTH' or 'MOON'
    isTravelling: false
};

// --- DOM Elements ---
// We use a getter or ensure this runs after DOM load via init, 
// but defining structure here is fine if looked up later.
// Actually, to be safe against nulls if this runs early, we'll keep the lookup object 
// but populate/use it inside init or just define it here assuming defer/bottom of body.
// The file is linked at bottom of body, so document.getElementById should work.
const dom = {
    scoreDisplay: document.getElementById('score-value'),

    // Systems
    earthSystem: document.getElementById('earth-system'),
    moonSystem: document.getElementById('moon-system'),

    // Interact Zones
    earthZone: document.getElementById('earth-interact-zone'),
    moonZone: document.getElementById('moon-interact-zone'),

    startOverlay: document.getElementById('start-overlay'),
    helpOverlay: document.getElementById('help-overlay'),

    resourcesOverlay: document.getElementById('resources-overlay'), // New
    toolsOverlay: document.getElementById('tools-overlay'), // New
    // Audio
    audioBg: document.getElementById('audio-bg-music'),
    audioClick: document.getElementById('audio-click'),
    audioPurchase: document.getElementById('audio-purchase'),

    // Top Right Buttons (Restored)
    btnMusic: document.getElementById('btn-music'),
    btnAudio: document.getElementById('btn-audio'),
    btnHelp: document.getElementById('btn-help'),
    btnProfile: document.getElementById('btn-profile'), // If needed

    // Menu & Controls
    menuOverlay: document.getElementById('menu-overlay'),
    btnMenu: document.getElementById('btn-menu'),
    btnCloseMenu: document.getElementById('btn-close-menu'),

    btnMenuResources: document.getElementById('btn-menu-resources'),
    btnMenuTools: document.getElementById('btn-menu-tools'),
    btnMenuAstronauts: document.getElementById('btn-menu-astronauts'), // Restored
    btnShop: document.getElementById('btn-shop'),
    btnLeaderboard: document.getElementById('btn-leaderboard'),

    // Shop Elements
    shopOverlay: document.getElementById('shop-overlay'),
    btnCloseShop: document.getElementById('btn-close-shop'),
    shopList: document.getElementById('shop-list'),
    shopTitle: document.getElementById('shop-title'),

    // Guide Close Buttons (Restored)
    btnCloseHelp: document.getElementById('btn-close-help'), // MISSING KEY RESTORED
    btnCloseResources: document.getElementById('btn-close-resources'),
    btnCloseTools: document.getElementById('btn-close-tools'),

    // Guide Tabs & Lists
    tabResEarth: document.getElementById('tab-res-earth'),
    tabResMoon: document.getElementById('tab-res-moon'),
    listResEarth: document.getElementById('list-res-earth'),
    listResMoon: document.getElementById('list-res-moon'),

    tabToolsEarth: document.getElementById('tab-tools-earth'),
    tabToolsMoon: document.getElementById('tab-tools-moon'),
    listToolsEarth: document.getElementById('list-tools-earth'),
    listToolsMoon: document.getElementById('list-tools-moon'),

    // Travel
    btnTravel: document.getElementById('btn-travel'),
    btnTravelText: document.querySelector('#btn-travel .title'),
    btnTravelHelper: document.querySelector('#btn-travel .text-container span:first-child')
};

// --- Audio Init ---
// --- Audio Init ---
function initAudio() {
    if (dom.audioBg && dom.audioBg.paused && state.musicEnabled) {
        dom.audioBg.volume = 0.3;
        dom.audioBg.play().catch(e => console.log("Audio autoplay blocked until interaction"));
    }
}

// --- Audio Features ---
function toggleMusic() {
    state.musicEnabled = !state.musicEnabled;
    const icon = dom.btnMusic;

    if (state.musicEnabled) {
        if (dom.audioBg) {
            dom.audioBg.volume = 0.3;
            if (dom.audioBg.paused) dom.audioBg.play().catch(() => { });
        }
        icon.style.opacity = '1';
        icon.classList.remove('fa-music-slash');
        icon.classList.add('fa-music');
    } else {
        if (dom.audioBg) dom.audioBg.pause();
        icon.style.opacity = '0.4'; // Dim to indicate off
        // Removed class switching to prevent icon disappearing if specific glyph is missing
    }
}

function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    const icon = dom.btnAudio;

    if (state.audioEnabled) {
        icon.style.opacity = '1';
    } else {
        icon.style.opacity = '0.4'; // Matches Music Icon
    }
}

// --- Help Logic ---
function toggleHelp() {
    dom.helpOverlay.classList.toggle('hidden');
}

// --- Menu Logic ---
function toggleMenu() {
    dom.menuOverlay.classList.toggle('hidden');
}

function toggleResources() {
    dom.menuOverlay.classList.add('hidden'); // Close Menu
    dom.resourcesOverlay.classList.toggle('hidden');
}

function toggleTools() {
    dom.menuOverlay.classList.add('hidden'); // Close Menu
    dom.toolsOverlay.classList.toggle('hidden');
}

// --- Shop Logic ---
function toggleShop() {
    const isHidden = dom.shopOverlay.classList.contains('hidden');
    if (isHidden) {
        // Opening
        dom.shopOverlay.classList.remove('hidden');
        renderShop();
    } else {
        // Closing
        dom.shopOverlay.classList.add('hidden');
    }
}

function renderShop() {
    dom.shopList.innerHTML = ''; // Clear previous

    let tools = [];
    if (state.location === 'MOON') {
        dom.shopTitle.textContent = "Moon Tools Shop";
        tools = CONFIG.moonTools;
    } else {
        dom.shopTitle.textContent = "Earth Tools Shop";
        tools = CONFIG.earthTools;
    }

    tools.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
            <img src="${tool.img}" alt="${tool.name}">
            <div class="shop-info">
                <div class="shop-name">${tool.name}</div>
                <div class="shop-price">$${tool.price}</div>
            </div>
            <button class="btn-buy" id="btn-buy-${tool.id}">BUY</button>
        `;
        dom.shopList.appendChild(item);

        // Add First Click Listener (Buy Logic + Audio)
        // Add First Click Listener (Sound Only)
        const btn = document.getElementById(`btn-buy-${tool.id}`);
        btn.addEventListener('click', () => {
            // Play Purchase Sound (Only if Enabled)
            if (state.audioEnabled && dom.audioPurchase) {
                dom.audioPurchase.currentTime = 0;
                dom.audioPurchase.play().catch(e => console.log("Audio play failed", e));
            }
            // No cost deduction, no visual change per request
        });
    });
}

// --- Tab Logic ---
function switchResourceTab(isEarth) {
    if (isEarth) {
        dom.tabResEarth.classList.add('active');
        dom.tabResMoon.classList.remove('active');
        dom.listResEarth.classList.remove('hidden');
        dom.listResMoon.classList.add('hidden');
    } else {
        dom.tabResEarth.classList.remove('active');
        dom.tabResMoon.classList.add('active');
        dom.listResEarth.classList.add('hidden');
        dom.listResMoon.classList.remove('hidden');
    }
}

function switchToolTab(isEarth) {
    if (isEarth) {
        dom.tabToolsEarth.classList.add('active');
        dom.tabToolsMoon.classList.remove('active');
        dom.listToolsEarth.classList.remove('hidden');
        dom.listToolsMoon.classList.add('hidden');
    } else {
        dom.tabToolsEarth.classList.remove('active');
        dom.tabToolsMoon.classList.add('active');
        dom.listToolsEarth.classList.add('hidden');
        dom.listToolsMoon.classList.remove('hidden');
    }
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

    popup.innerHTML = `
        <img src="${resource.img}" alt="${resource.name}">
        <span>+${resource.value}</span>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// --- Travel Logic ---
function updateTravelButton() {
    if (state.location === 'EARTH') {
        dom.btnTravelHelper.textContent = "Fly to the";
        dom.btnTravelText.textContent = "Moon";
    } else {
        dom.btnTravelHelper.textContent = "Fly to";
        dom.btnTravelText.textContent = "Earth";
    }
}

function handleTravel() {
    if (state.isTravelling || !state.gameStarted) return;

    state.isTravelling = true;

    // Fade OUT button
    dom.btnTravel.classList.remove('visible');

    if (state.location === 'EARTH') {
        dom.earthSystem.classList.add('off-screen-left');
        dom.moonSystem.classList.remove('off-screen-right');
        state.location = 'MOON';
    } else {
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


function handleMine(e) {
    // Only allow Left Click (button 0)
    if (e.button !== 0) return;

    // --- Start Game Logic ---
    if (!state.gameStarted) {
        state.gameStarted = true;
        dom.startOverlay.classList.add('hidden');
        dom.btnTravel.classList.add('visible'); // Show Travel Button
        initAudio();
        return;
    }

    // --- Mining Logic ---
    // Prevent interaction during travel
    if (state.isTravelling) return;

    // Rate Limit
    const now = Date.now();
    if (now - state.lastClickTime < CONFIG.clickRateLimitMs) return;

    state.lastClickTime = now;

    if (state.audioEnabled && dom.audioClick) {
        const sound = dom.audioClick.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(() => { });
    }

    const resource = getRandomResource();
    state.score += resource.value;

    dom.scoreDisplay.textContent = state.score.toLocaleString();

    spawnPopup(e.clientX, e.clientY, resource);

    localStorage.setItem('worldClickerScore', state.score);

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

// --- Initialization ---
function init() {
    // Load Score
    const savedScore = localStorage.getItem('worldClickerScore');
    if (savedScore) {
        state.score = parseInt(savedScore, 10) || 0;
        dom.scoreDisplay.textContent = state.score.toLocaleString();
    }

    // Click Listeners
    if (dom.earthZone) dom.earthZone.addEventListener('mousedown', handleMine);
    if (dom.moonZone) dom.moonZone.addEventListener('mousedown', handleMine);
    // Fix: Allow clicking the "PLAY" text/overlay to start the game
    if (dom.startOverlay) dom.startOverlay.addEventListener('click', handleMine);

    // Travel
    if (dom.btnTravel) dom.btnTravel.addEventListener('click', handleTravel);

    // Audio
    if (dom.btnMusic) dom.btnMusic.addEventListener('click', toggleMusic);
    if (dom.btnAudio) dom.btnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAudio();
    });

    // Help Listeners
    if (dom.btnHelp) {
        dom.btnHelp.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHelp();
        });
    }
    if (dom.btnCloseHelp) {
        dom.btnCloseHelp.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleHelp();
        });
    }

    // Menu Listeners
    if (dom.btnMenu) {
        dom.btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }
    if (dom.btnCloseMenu) {
        dom.btnCloseMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }



    // Guide Listeners
    if (dom.btnMenuResources) dom.btnMenuResources.addEventListener('click', toggleResources);
    if (dom.btnMenuTools) dom.btnMenuTools.addEventListener('click', toggleTools);
    if (dom.btnMenuAstronauts) dom.btnMenuAstronauts.addEventListener('click', () => console.log("Astronauts clicked"));

    // Bottom Buttons
    if (dom.btnShop) dom.btnShop.addEventListener('click', toggleShop);
    // Leaderboard listener would go here

    if (dom.btnCloseResources) dom.btnCloseResources.addEventListener('click', () => dom.resourcesOverlay.classList.add('hidden'));
    if (dom.btnCloseTools) dom.btnCloseTools.addEventListener('click', () => dom.toolsOverlay.classList.add('hidden'));
    if (dom.btnCloseShop) dom.btnCloseShop.addEventListener('click', toggleShop); // Shop Close Listener

    // Tab Listeners
    if (dom.tabResEarth) dom.tabResEarth.addEventListener('click', () => switchResourceTab(true));
    if (dom.tabResMoon) dom.tabResMoon.addEventListener('click', () => switchResourceTab(false));

    if (dom.tabToolsEarth) dom.tabToolsEarth.addEventListener('click', () => switchToolTab(true));
    if (dom.tabToolsMoon) dom.tabToolsMoon.addEventListener('click', () => switchToolTab(false));

    document.addEventListener('dragstart', e => e.preventDefault());

    // Disable Right Click Menu
    document.addEventListener('contextmenu', e => e.preventDefault());
}

// --- Loading & Preload Logic ---
async function preloadAssets() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingBar = document.getElementById('loading-bar-fill');

    // 1. Gather all Assets
    const imagePaths = [
        'space/background.png',
        'space/earth.png',
        'space/clouds.png',
        'space/earth_glow.png',
        'space/circular_shading.png',
        'space/moon.png',
        'space/moon_border.png',
        'space/moon_glow.png',
        'favicon.png'
    ];

    // Add Resources
    CONFIG.resources.forEach(r => imagePaths.push(r.img));
    CONFIG.moonResources.forEach(r => imagePaths.push(r.img));

    // Add Tools
    CONFIG.earthTools.forEach(t => imagePaths.push(t.img));
    CONFIG.moonTools.forEach(t => imagePaths.push(t.img));

    const audioPaths = [
        'sounds/background_music.ogg',
        'sounds/pop_sound.wav',
        'sounds/purchase_sound.wav'
    ];

    const totalAssets = imagePaths.length + audioPaths.length + 1; // +1 for fonts
    let loadedCount = 0;

    const updateProgress = () => {
        loadedCount++;
        const percent = Math.min((loadedCount / totalAssets) * 100, 100);
        if (loadingBar) loadingBar.style.width = `${percent}%`;
    };

    // 2. Load Images
    const imagePromises = imagePaths.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => { updateProgress(); resolve(); };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                updateProgress(); // Count errors too to avoid hanging
                resolve();
            };
        });
    });

    // 3. Load Audio
    // For audio, we use fetch/blob or just Audio object. 
    // Audio object 'canplaythrough' is best for game SFX.
    const audioPromises = audioPaths.map(src => {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.src = src;
            // 'canplaythrough' implies it's ready to play
            // 'loadeddata' is faster but maybe not "fully" ready
            // We'll use a timeout fallback just in case audio strictness blocks us
            const onReady = () => {
                cleanup();
                updateProgress();
                resolve();
            };

            const onError = () => {
                cleanup();
                console.warn(`Failed to load audio: ${src}`);
                updateProgress();
                resolve();
            };

            const cleanup = () => {
                audio.removeEventListener('canplaythrough', onReady);
                audio.removeEventListener('error', onError);
            };

            audio.addEventListener('canplaythrough', onReady);
            audio.addEventListener('error', onError);

            // Fallback if browser policy or network stalls audio
            setTimeout(() => {
                if (loadedCount < totalAssets) {
                    // Force resolve this specific one if it's taking too long (3s)
                    // But we rely on the event mostly.
                    // Actually, let's just let the promise race or handle it.
                    // We won't force resolve here to respect "Real Loading", 
                    // but we don't want to hang forever.
                }
            }, 5000);

            // Trigger load
            audio.load();
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
            }, 500);
        } else {
            init();
        }
    }, 500);
}


// Run
window.addEventListener('DOMContentLoaded', preloadAssets);
