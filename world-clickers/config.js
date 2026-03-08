/**
 * World Clickers - Game Config
 * Edit values below to adjust game balance.
 * After editing, just refresh the browser.
 */
const GAME_CONFIG = {
    // --- Global Settings ---
    priceMultiplier: 1.16, // Higher = prices escalate faster
    moonUnlockCost: 30000000,   // Cost to travel to the moon
    clickRateLimitMs: 100, // Anti-cheat: max 10 clicks per second

    // --- Earth Resources ---
    // value: base price when sold
    resources: [
        { name: 'WOOD', value: 1, img: 'resources/wood.png' },
        { name: 'FISH', value: 2, img: 'resources/fish.png' },
        { name: 'COAL', value: 4, img: 'resources/coal.png' },
        { name: 'STONE', value: 7, img: 'resources/stone.png' },
        { name: 'OIL', value: 11, img: 'resources/oil.png' },
        { name: 'IRON', value: 17, img: 'resources/iron.png' },
        { name: 'COPPER', value: 25, img: 'resources/copper.png' },
        { name: 'SILVER', value: 38, img: 'resources/silver.png' },
        { name: 'GOLD', value: 58, img: 'resources/gold.png' },
        { name: 'DIAMOND', value: 90, img: 'resources/diamond.png' }
    ],

    // --- Moon Resources ---
    moonResources: [
        { name: 'REGOLITH DUST', value: 140, img: 'resources/regolith_dust.png' },
        { name: 'LUNAR GLASS', value: 210, img: 'resources/lunar_glass.png' },
        { name: 'LUNAR ICE', value: 320, img: 'resources/lunar_ice.png' },
        { name: 'LUNAR SAPPHIRE', value: 480, img: 'resources/lunar_sapphire.png' },
        { name: 'ANCIENT METEOR ALLOY', value: 720, img: 'resources/ancient_meteor_alloy.png' },
        { name: 'QUANTUM FIBER', value: 1080, img: 'resources/quantum_fiber.png' },
        { name: 'STARDUST CRYSTALS', value: 1620, img: 'resources/stardust_crystals.png' },
        { name: 'MOONSTONE CORE', value: 2450, img: 'resources/moonstone_core.png' },
        { name: 'DARK MATTER FRAGMENTS', value: 3700, img: 'resources/dark_matter_fragments.png' },
        { name: 'ETHEREUM PULSE', value: 5600, img: 'resources/ethereum_pulse.png' }
    ],

    // --- Earth Tools ---
    // price: base cost for the first purchase
    // val: how many resources it mines per second
    earthTools: [
        { id: 't_wood', name: 'Timber Axe', price: 400, val: 1, res: 'Wood', img: 'tools/timber_axe.png' },
        { id: 't_fish', name: 'Hydro Netter', price: 1000, val: 2, res: 'Fish', img: 'tools/hydro_netter.png' },
        { id: 't_coal', name: 'Coal Cracker', price: 2800, val: 4, res: 'Coal', img: 'tools/coal_cracker.png' },
        { id: 't_stone', name: 'Stone Splitter', price: 7000, val: 6, res: 'Stone', img: 'tools/stone_splitter.png' },
        { id: 't_oil', name: 'Oil Extractor', price: 18000, val: 10, res: 'Oil', img: 'tools/oil_extractor.png' },
        { id: 't_iron', name: 'Iron Digger', price: 45000, val: 14, res: 'Iron', img: 'tools/iron_digger.png' },
        { id: 't_copper', name: 'Copper Cutter', price: 110000, val: 20, res: 'Copper', img: 'tools/copper_cutter.png' },
        { id: 't_silver', name: 'Silver Shaver', price: 270000, val: 28, res: 'Silver', img: 'tools/silver_shaver.png' },
        { id: 't_gold', name: 'Gold Miner Rig', price: 650000, val: 38, res: 'Gold', img: 'tools/gold_miner_rig.png' },
        { id: 't_diamond', name: 'Crystal Drill', price: 1500000, val: 52, res: 'Diamond', img: 'tools/crystal_pierce_drill.png' }
    ],

    // --- Moon Tools ---
    moonTools: [
        { id: 'm_dust', name: 'Dust Vacuumer', price: 3500000, val: 18, res: 'Regolith Dust', img: 'tools/dust_vacuumer.png' },
        { id: 'm_glass', name: 'Glass Glow Cutter', price: 7000000, val: 22, res: 'Lunar Glass', img: 'tools/glass_glow_cutter.png' },
        { id: 'm_ice', name: 'Frost Core Drill', price: 14000000, val: 28, res: 'Lunar Ice', img: 'tools/frost_core_drill.png' },
        { id: 'm_sapphire', name: 'Sapphire Saw', price: 28000000, val: 34, res: 'Lunar Sapphire', img: 'tools/sapphire_saw.png' },
        { id: 'm_meteor', name: 'Meteor Forge', price: 56000000, val: 40, res: 'Meteor Alloy', img: 'tools/meteor_forge_extractor.png' },
        { id: 'm_fiber', name: 'Quantum Puller', price: 110000000, val: 48, res: 'Quantum Fiber', img: 'tools/quantum_thread_puller.png' },
        { id: 'm_shard', name: 'Star Shard Collector', price: 220000000, val: 56, res: 'Stardust', img: 'tools/star_shard_collector.png' },
        { id: 'm_core', name: 'Core Pulse Harvester', price: 440000000, val: 66, res: 'Moonstone', img: 'tools/core_pulse_harvester.png' },
        { id: 'm_void', name: 'Void Splitter', price: 880000000, val: 78, res: 'Dark Matter', img: 'tools/void_splitter.png' },
        { id: 'm_pulse', name: 'Pulse Conductor', price: 1760000000, val: 92, res: 'Ether. Pulse', img: 'tools/pulse_conductor.png' }
    ]
};