/**
 * World Clickers - Game Config
 * Rebalanced for better manual clicking, heat progression,
 * and stronger Earth -> Moon -> Mars pacing.
 */
const GAME_CONFIG = {
    // --- Global Settings ---
    priceMultiplier: 1.15,
    moonUnlockCost: 500000000,
    marsUnlockCost: 600000000000,
    clickRateLimitMs: 100,      // 10 clicks/sec max

    // --- Challenge System ---
    challengeDurationSeconds: 60,   // How long a challenge stays on screen
    challengeCooldownSeconds: 150,  // Wait time between challenges
    challengePrizeMultiplier: 5,   // Prize = autoMine × this × clickCount
    manualMultiplierIntervalSeconds: 15, // Time to double the manual multiplier
    manualMultiplierMax: 32,      // Maximum manual multiplier cap

    // Heat balance:
    // At max click speed: +25 heat/sec from clicks, -12 heat/sec decay = +13 net/sec
    // This makes top resource reachable in about 7.7s if max heat is 100.
    heatIncreasePerClick: 2.5,
    heatDecayPerSecond: 12,

    // --- Earth Resources (01-10) ---
    resources: [
        { name: 'WOOD', value: 1, img: 'resources/01_wood.png' },
        { name: 'FISH', value: 2, img: 'resources/02_fish.png' },
        { name: 'STONE', value: 4, img: 'resources/03_stone.png' },
        { name: 'COAL', value: 7, img: 'resources/04_coal.png' },
        { name: 'OIL', value: 11, img: 'resources/05_oil.png' },
        { name: 'IRON ORE', value: 17, img: 'resources/06_iron_ore.png' },
        { name: 'COPPER ORE', value: 25, img: 'resources/07_copper_ore.png' },
        { name: 'SILVER ORE', value: 38, img: 'resources/08_silver_ore.png' },
        { name: 'GOLD ORE', value: 58, img: 'resources/09_gold_ore.png' },
        { name: 'DIAMOND', value: 90, img: 'resources/10_diamond.png' }
    ],

    // --- Moon Resources (11-20) ---
    moonResources: [
        { name: 'REGOLITH DUST', value: 140, img: 'resources/11_regolith_dust.png' },
        { name: 'LUNAR BASALT', value: 210, img: 'resources/12_lunar_basalt.png' },
        { name: 'LUNAR ICE', value: 320, img: 'resources/13_lunar_ice.png' },
        { name: 'LUNAR PLATES', value: 480, img: 'resources/14_lunar_plates.png' },
        { name: 'METEOR ALLOY', value: 720, img: 'resources/15_meteor_alloy.png' },
        { name: 'LUNAR SAPPHIRE', value: 1080, img: 'resources/16_lunar_sapphire.png' },
        { name: 'QUANTUM FIBER', value: 1620, img: 'resources/17_quantum_fiber.png' },
        { name: 'STARDUST CRYSTALS', value: 2450, img: 'resources/18_stardust_crystals.png' },
        { name: 'MOONSTONE CORE', value: 3700, img: 'resources/19_moonstone_core.png' },
        { name: 'DARK MATTER', value: 5600, img: 'resources/20_dark_matter.png' }
    ],

    // --- Mars Resources (21-30) ---
    marsResources: [
        { name: 'REDSTONE', value: 8500, img: 'resources/21_redstone.png' },
        { name: 'VOID COAL', value: 12800, img: 'resources/22_void_coal.png' },
        { name: 'MARTIAN ICE', value: 19200, img: 'resources/23_martian_ice.png' },
        { name: 'IRON CLUSTER', value: 28800, img: 'resources/24_iron_cluster.png' },
        { name: 'MARTIAN CARBON', value: 43200, img: 'resources/25_martian_carbon.png' },
        { name: 'SUNSTONE', value: 64800, img: 'resources/26_sunstone.png' },
        { name: 'PALE ORE', value: 97200, img: 'resources/27_pale_ore.png' },
        { name: 'HEX METAL', value: 145800, img: 'resources/28_hex_metal.png' },
        { name: 'GRAVITY CORE', value: 218700, img: 'resources/29_gravity_core.png' },
        { name: 'LAVA GEM', value: 328000, img: 'resources/30_lave-gem.png' }
    ],

    // --- Earth Tools (01-10) ---
    earthTools: [
        { id: 't_wood', name: 'Timber Axe',      price: 3500,     val: 100,  res: 'Wood',       img: 'tools/01_timber_axe.png' },
        { id: 't_fish', name: 'Hydro Netter',    price: 9000,     val: 130,  res: 'Fish',       img: 'tools/02_hydro_netter.png' },
        { id: 't_stone', name: 'Stone Splitter', price: 24000,    val: 260,  res: 'Stone',      img: 'tools/03_stone_splitter.png' },
        { id: 't_coal', name: 'Coal Cracker',    price: 62000,    val: 180,  res: 'Coal',       img: 'tools/04_coal_cracker.png' },
        { id: 't_oil', name: 'Oil Extractor',    price: 160000,   val: 430,  res: 'Oil',        img: 'tools/05_oil_extractor.png' },
        { id: 't_iron', name: 'Iron Digger',     price: 400000,   val: 670,  res: 'Iron Ore',   img: 'tools/06_iron_digger.png' },
        { id: 't_copper', name: 'Copper Cutter', price: 1000000,  val: 1100, res: 'Copper Ore', img: 'tools/07_copper_cutter.png' },
        { id: 't_silver', name: 'Silver Shaver', price: 2500000,  val: 1800, res: 'Silver Ore', img: 'tools/08_silver_shaver.png' },
        { id: 't_gold', name: 'Gold Miner',      price: 6000000,  val: 2700, res: 'Gold Ore',   img: 'tools/09_gold_miner.png' },
        { id: 't_diamond', name: 'Crystal Drill',price: 14500000, val: 4100, res: 'Diamond',    img: 'tools/10_crystal_drill.png' }
    ],

    // --- Moon Tools (11-20) ---
    moonTools: [
        { id: 'm_dust',     name: 'Dust Vacuumer',   price: 35000000,    val: 6400,  res: 'Regolith Dust',     img: 'tools/11_dust_vacuumer.png' },
        { id: 'm_basalt',   name: 'Basalt Breaker',  price: 75000000,    val: 9200,  res: 'Lunar Basalt',      img: 'tools/12_basalt_breaker.png' },
        { id: 'm_ice',      name: 'Frost Drill',     price: 150000000,   val: 11700, res: 'Lunar Ice',         img: 'tools/13_frost_drill.png' },
        { id: 'm_plates',   name: 'Plates Cutter',   price: 300000000,   val: 15600, res: 'Lunar Plates',      img: 'tools/14_plates_cutter.png' },
        { id: 'm_meteor',   name: 'Meteor Extractor',price: 600000000,   val: 20800, res: 'Meteor Alloy',      img: 'tools/15_meteor_extractor.png' },
        { id: 'm_sapphire', name: 'Sapphire Saw',    price: 1200000000,  val: 27100, res: 'Lunar Sapphire',    img: 'tools/16_sapphire_saw.png' },
        { id: 'm_fiber',    name: 'Quantum Weaver',  price: 2400000000,  val: 36100, res: 'Quantum Fiber',     img: 'tools/17_quantum_weaver.png' },
        { id: 'm_shard',    name: 'Shard Collector', price: 4800000000,  val: 46650, res: 'Stardust Crystals', img: 'tools/18_shard_collector.png' },
        { id: 'm_core',     name: 'Core Harvester',  price: 9600000000,  val: 61800, res: 'Moonstone Core',    img: 'tools/19_core_harvester.png' },
        { id: 'm_void',     name: 'Abyss Engine',    price: 19200000000, val: 79700, res: 'Dark Matter',       img: 'tools/20_abyss_engine.png' }
    ],

    // --- Mars Tools (21-30) ---
    marsTools: [
        { id: 'x_redstone', name: 'Redstone Rig',       price: 26000000000,    val: 80000,  res: 'Redstone',       img: 'tools/21_redstone_rig.png' },
        { id: 'x_void',     name: 'Void Drill',         price: 52000000000,    val: 92000,  res: 'Void Coal',      img: 'tools/22_void_dril.png' },
        { id: 'x_ice',      name: 'Ice Harvester',      price: 104000000000,   val: 123000, res: 'Martian Ice',    img: 'tools/23_ice_harvester.png' },
        { id: 'x_cluster',  name: 'Cluster Miner',      price: 208000000000,   val: 164000, res: 'Iron Cluster',   img: 'tools/24_cluster_miner.png' },
        { id: 'x_carbon',   name: 'Carbon Cutter',      price: 416000000000,   val: 219000, res: 'Martian Carbon', img: 'tools/25_carbon_cutter.png' },
        { id: 'x_sunstone', name: 'Sunstone Extractor', price: 832000000000,   val: 292000, res: 'Sunstone',       img: 'tools/26_sunstone_extractor.png' },
        { id: 'x_pale',     name: 'Dust Sifter',        price: 1664000000000,  val: 389000, res: 'Pale Ore',       img: 'tools/27_dust_sifter.png' },
        { id: 'x_hex',      name: 'Hex Press',          price: 3328000000000,  val: 519000, res: 'Hex Metal',      img: 'tools/28_hex_press.png' },
        { id: 'x_gravity',  name: 'Gravity Engine',     price: 6656000000000,  val: 692000, res: 'Gravity Core',   img: 'tools/29_gravity_engine.png' },
        { id: 'x_lava',     name: 'Lava Stabilizer',    price: 13312000000000, val: 922000, res: 'Lava Gem',       img: 'tools/30_lava_stabilizer.png' }
    ]
};