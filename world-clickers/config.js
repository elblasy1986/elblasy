/** * World Clickers - Game Config
 * The "Deep Logic" Edition - Flawless 10-15 Min Planet Sessions.
 * * CORE MATH RULES APPLIED:
 * - 100-Second Payoff: Every tool price = (val * resourceValue * 100).
 * - Tool dominance: Late game tools output Billions/sec, utterly eclipsing manual clicks.
 * - Manual synergy: You need high-heat manual clicks (4096x) to afford the early steep tool prices.
 * - Planet Scaling: Prices and Resources scale by exactly 1,000,000x per planet. 
 * - Tool base 'val' remains universally constant so they always feel like massive upgrades.
 */
const GAME_CONFIG = {
    // --- Global Settings ---
    priceMultiplier: 1.15,
    moonUnlockCost:    2.5e12, // 2.5 Trillion (5x the price of the final Earth tool)
    marsUnlockCost:    2.5e18, // 2.5 Quintillion
    jupiterUnlockCost: 2.5e24, // 2.5 Septillion
    saturnUnlockCost:  2.5e30, // 2.5 Nonillion
    uranusUnlockCost:  2.5e36, // 2.5 Undecillion
    neptuneUnlockCost: 2.5e42, // 2.5 Tredecillion
    clickRateLimitMs: 100,     // 10 clicks/sec max

    // --- Challenge System ---
    challengeDurationSeconds: 60,
    challengeCooldownSeconds: 90,
    challengePrizeMultiplier: 10, 
    manualMultiplierIntervalSeconds: 2.5,
    manualMultiplierMax: 4096,

    // Heat balance
    heatIncreasePerClick: 2.5,
    heatDecayPerSecond: 12,

    // --- Earth Resources (01-10) ---
    resources: [
        { name: 'WOOD', value: 1, img: 'resources/01_wood.png' },
        { name: 'FISH', value: 2, img: 'resources/02_fish.png' },
        { name: 'STONE', value: 4, img: 'resources/03_stone.png' },
        { name: 'COAL', value: 7, img: 'resources/04_coal.png' },
        { name: 'OIL', value: 12, img: 'resources/05_oil.png' },
        { name: 'IRON ORE', value: 20, img: 'resources/06_iron_ore.png' },
        { name: 'COPPER ORE', value: 32, img: 'resources/07_copper_ore.png' },
        { name: 'SILVER ORE', value: 48, img: 'resources/08_silver_ore.png' },
        { name: 'GOLD ORE', value: 72, img: 'resources/09_gold_ore.png' },
        { name: 'DIAMOND', value: 100, img: 'resources/10_diamond.png' }
    ],

    // --- Moon Resources (11-20) ---
    // Scale: x 1 Million
    moonResources: [
        { name: 'REGOLITH DUST', value: 1e6, img: 'resources/11_regolith_dust.png' },
        { name: 'LUNAR BASALT', value: 2e6, img: 'resources/12_lunar_basalt.png' },
        { name: 'LUNAR ICE', value: 4e6, img: 'resources/13_lunar_ice.png' },
        { name: 'LUNAR PLATES', value: 7e6, img: 'resources/14_lunar_plates.png' },
        { name: 'METEOR ALLOY', value: 12e6, img: 'resources/15_meteor_alloy.png' }, 
        { name: 'LUNAR SAPPHIRE', value: 20e6, img: 'resources/16_lunar_sapphire.png' },
        { name: 'QUANTUM FIBER', value: 32e6, img: 'resources/17_quantum_fiber.png' },
        { name: 'STARDUST CRYSTALS', value: 48e6, img: 'resources/18_stardust_crystals.png' },
        { name: 'MOONSTONE CORE', value: 72e6, img: 'resources/19_moonstone_core.png' },
        { name: 'DARK MATTER', value: 100e6, img: 'resources/20_dark_matter.png' }
    ],

    // --- Mars Resources (21-30) ---
    // Scale: x 1 Trillion (1e12)
    marsResources: [
        { name: 'REDSTONE', value: 1e12, img: 'resources/21_redstone.png' },
        { name: 'VOID COAL', value: 2e12, img: 'resources/22_void_coal.png' },
        { name: 'MARTIAN ICE', value: 4e12, img: 'resources/23_martian_ice.png' },
        { name: 'IRON CLUSTER', value: 7e12, img: 'resources/24_iron_cluster.png' },
        { name: 'MARTIAN CARBON', value: 12e12, img: 'resources/25_martian_carbon.png' },
        { name: 'SUNSTONE', value: 20e12, img: 'resources/26_sunstone.png' },
        { name: 'PALE ORE', value: 32e12, img: 'resources/27_pale_ore.png' },
        { name: 'HEX METAL', value: 48e12, img: 'resources/28_hex_metal.png' },
        { name: 'GRAVITY CORE', value: 72e12, img: 'resources/29_gravity_core.png' },
        { name: 'LAVA GEM', value: 100e12, img: 'resources/30_lave-gem.png' }
    ],

    // --- Jupiter Resources (31-40) ---
    // Scale: x 1 Quintillion (1e18)
    jupiterResources: [
        { name: 'GAS VAPOR', value: 1e18, img: 'resources/31_gas_vapor.png' },
        { name: 'AMMONIA CLOUD', value: 2e18, img: 'resources/32_ammonia_cloud.png' },
        { name: 'SULFUR SHARD', value: 4e18, img: 'resources/33_sulfur_shard.png' },
        { name: 'STORM CRYSTAL', value: 7e18, img: 'resources/34_storm_crystal.png' },
        { name: 'METALLIC HYDROGEN', value: 12e18, img: 'resources/35_metallic_hydrogen.png' },
        { name: 'PLASMA CORE', value: 20e18, img: 'resources/36_plasma_core.png' },
        { name: 'GREAT RED ESSENCE', value: 32e18, img: 'resources/37_great_red_essence.png' },
        { name: 'LIGHTNING BOLT', value: 48e18, img: 'resources/38_lightning_bolt.png' },
        { name: 'GRAVITY BEAD', value: 72e18, img: 'resources/39_gravity_bead.png' },
        { name: 'JOVIAN SINGULARITY', value: 100e18, img: 'resources/40_jovian_singularity.png' }
    ],

    // --- Saturn Resources (41-50) ---
    // Scale: x 1 Septillion (1e24)
    saturnResources: [
        { name: 'RING DUST', value: 1e24, img: 'resources/41_ring_dust.png' },
        { name: 'ICE FRAGMENT', value: 2e24, img: 'resources/42_ice_fragment.png' },
        { name: 'TITAN METHANE', value: 4e24, img: 'resources/43_titan_methane.png' },
        { name: 'GOLDEN GAS', value: 7e24, img: 'resources/44_golden_gas.png' },
        { name: 'ENCELADUS WATER', value: 12e24, img: 'resources/45_enceladus_water.png' },
        { name: 'DIAMOND RAIN', value: 20e24, img: 'resources/46_diamond_rain.png' },
        { name: 'CHRONOS SAND', value: 32e24, img: 'resources/47_chronos_sand.png' },
        { name: 'ORBIT SHUTTER', value: 48e24, img: 'resources/48_orbit_shutter.png' },
        { name: 'RING RESONANCE', value: 72e24, img: 'resources/49_ring_resonance.png' },
        { name: 'SATURNIAN CROWN', value: 100e24, img: 'resources/50_saturnian_crown.png' }
    ],

    // --- Uranus Resources (51-60) ---
    // Scale: x 1 Nonillion (1e30)
    uranusResources: [
        { name: 'CYAN VAPOR', value: 1e30, img: 'resources/51_cyan_vapor.png' },
        { name: 'METHANE SLUSH', value: 2e30, img: 'resources/52_methane_slush.png' },
        { name: 'URANIAN ICE', value: 4e30, img: 'resources/53_uranian_ice.png' },
        { name: 'CYAN CRYSTAL', value: 7e30, img: 'resources/54_cyan_crystal.png' },
        { name: 'AQUAMARINE ORE', value: 12e30, img: 'resources/55_aquamarine_ore.png' }, 
        { name: 'DIAMOND SLUSH', value: 20e30, img: 'resources/56_diamond_slush.png' },
        { name: 'FROZEN CORE', value: 32e30, img: 'resources/57_frozen_core.png' },
        { name: 'AETHER MIST', value: 48e30, img: 'resources/58_aether_mist.png' },
        { name: 'TILTED SHARD', value: 72e30, img: 'resources/59_tilted_shard.png' },
        { name: 'CELESTIAL ICE', value: 100e30, img: 'resources/60_celestial_ice.png' }
    ],

    // --- Neptune Resources (61-70) ---
    // Scale: x 1 Undecillion (1e36)
    neptuneResources: [
        { name: 'AZURE MIST', value: 1e36, img: 'resources/61_azure_mist.png' },
        { name: 'TRITON LIQUID', value: 2e36, img: 'resources/62_triton_liquid.png' },
        { name: 'NEPTUNIAN ICE', value: 4e36, img: 'resources/63_neptunian_ice.png' },
        { name: 'STORM ESSENCE', value: 7e36, img: 'resources/64_storm_essence.png' },
        { name: 'AZURE CRYSTAL', value: 12e36, img: 'resources/65_azure_crystal.png' },
        { name: 'DEEP SEA CORE', value: 20e36, img: 'resources/66_deep_sea_core.png' }, 
        { name: 'WHALE BONE', value: 32e36, img: 'resources/67_whale_bone.png' },
        { name: 'TRITON PEARL', value: 48e36, img: 'resources/68_triton_pearl.png' }, 
        { name: 'ABYSSAL MIST', value: 72e36, img: 'resources/69_abyss_mist.png' },
        { name: 'NEPTUNIAN HEART', value: 100e36, img: 'resources/70_neptune_heart.png' }
    ],

    // --- Earth Tools (01-10) ---
    // Auto-Income ranges from 5,000/sec (Axe) to 5,000,000,000/sec (Drill)
    earthTools: [
        { id: 't_wood', name: 'Timber Axe', price: 500000, val: 5000, res: 'Wood', img: 'tools/01_timber_axe.png' },
        { id: 't_fish', name: 'Hydro Netter', price: 3000000, val: 15000, res: 'Fish', img: 'tools/02_hydro_netter.png' },
        { id: 't_stone', name: 'Stone Splitter', price: 12000000, val: 30000, res: 'Stone', img: 'tools/03_stone_splitter.png' },
        { id: 't_coal', name: 'Coal Cracker', price: 56000000, val: 80000, res: 'Coal', img: 'tools/04_coal_cracker.png' },
        { id: 't_oil', name: 'Oil Extractor', price: 240000000, val: 200000, res: 'Oil', img: 'tools/05_oil_extractor.png' },
        { id: 't_iron', name: 'Iron Digger', price: 1000000000, val: 500000, res: 'Iron Ore', img: 'tools/06_iron_digger.png' },
        { id: 't_copper', name: 'Copper Cutter', price: 4800000000, val: 1500000, res: 'Copper Ore', img: 'tools/07_copper_cutter.png' },
        { id: 't_silver', name: 'Silver Shaver', price: 24000000000, val: 5000000, res: 'Silver Ore', img: 'tools/08_silver_shaver.png' },
        { id: 't_gold', name: 'Gold Miner', price: 108000000000, val: 15000000, res: 'Gold Ore', img: 'tools/09_gold_miner.png' },
        { id: 't_diamond', name: 'Crystal Drill', price: 500000000000, val: 50000000, res: 'Diamond', img: 'tools/10_crystal_drill.png' }
    ],

    // --- Moon Tools (11-20) ---
    // Prices scale exactly 1 Million times higher than Earth. Val remains locked so tools are ALWAYS visually massive.
    moonTools: [
        { id: 'm_dust', name: 'Dust Vacuumer', price: 5e11, val: 5000, res: 'Regolith Dust', img: 'tools/11_dust_vacuumer.png' },
        { id: 'm_basalt', name: 'Basalt Breaker', price: 3e12, val: 15000, res: 'Lunar Basalt', img: 'tools/12_basalt_breaker.png' },
        { id: 'm_ice', name: 'Frost Drill', price: 1.2e13, val: 30000, res: 'Lunar Ice', img: 'tools/13_frost_drill.png' },
        { id: 'm_plates', name: 'Plates Cutter', price: 5.6e13, val: 80000, res: 'Lunar Plates', img: 'tools/14_plates_cutter.png' },
        { id: 'm_meteor', name: 'Meteor Extractor', price: 2.4e14, val: 200000, res: 'Meteor Alloy', img: 'tools/15_meteor_extractor.png' },
        { id: 'm_sapphire', name: 'Sapphire Saw', price: 1e15, val: 500000, res: 'Lunar Sapphire', img: 'tools/16_sapphire_saw.png' },
        { id: 'm_fiber', name: 'Quantum Weaver', price: 4.8e15, val: 1500000, res: 'Quantum Fiber', img: 'tools/17_quantum_weaver.png' },
        { id: 'm_shard', name: 'Shard Collector', price: 2.4e16, val: 5000000, res: 'Stardust Crystals', img: 'tools/18_shard_collector.png' }, 
        { id: 'm_core', name: 'Core Harvester', price: 1.08e17, val: 15000000, res: 'Moonstone Core', img: 'tools/19_core_harvester.png' },
        { id: 'm_void', name: 'Abyss Engine', price: 5e17, val: 50000000, res: 'Dark Matter', img: 'tools/20_abyss_engine.png' }
    ],

    // --- Mars Tools (21-30) ---
    marsTools: [
        { id: 'x_redstone', name: 'Redstone Rig', price: 5e17, val: 5000, res: 'Redstone', img: 'tools/21_redstone_rig.png' },
        { id: 'x_void', name: 'Void Drill', price: 3e18, val: 15000, res: 'Void Coal', img: 'tools/22_void_dril.png' },
        { id: 'x_ice', name: 'Ice Harvester', price: 1.2e19, val: 30000, res: 'Martian Ice', img: 'tools/23_ice_harvester.png' },
        { id: 'x_cluster', name: 'Cluster Miner', price: 5.6e19, val: 80000, res: 'Iron Cluster', img: 'tools/24_cluster_miner.png' },
        { id: 'x_carbon', name: 'Carbon Cutter', price: 2.4e20, val: 200000, res: 'Martian Carbon', img: 'tools/25_carbon_cutter.png' },
        { id: 'x_sunstone', name: 'Sunstone Extractor', price: 1e21, val: 500000, res: 'Sunstone', img: 'tools/26_sunstone_extractor.png' },
        { id: 'x_pale', name: 'Dust Sifter', price: 4.8e21, val: 1500000, res: 'Pale Ore', img: 'tools/27_dust_sifter.png' },
        { id: 'x_hex', name: 'Hex Press', price: 2.4e22, val: 5000000, res: 'Hex Metal', img: 'tools/28_hex_press.png' }, 
        { id: 'x_gravity', name: 'Gravity Engine', price: 1.08e23, val: 15000000, res: 'Gravity Core', img: 'tools/29_gravity_engine.png' },
        { id: 'x_lava', name: 'Lava Stabilizer', price: 5e23, val: 50000000, res: 'Lava Gem', img: 'tools/30_lava_stabilizer.png' }
    ],

    // --- Jupiter Tools (31-40) ---
    jupiterTools: [
        { id: 'j_vapor', name: 'Vapor Siphon', price: 5e23, val: 5000, res: 'Gas Vapor', img: 'tools/31_vapor_siphon.png' },
        { id: 'j_ammonia', name: 'Cloud Condenser', price: 3e24, val: 15000, res: 'Ammonia Cloud', img: 'tools/32_cloud_condenser.png' },
        { id: 'j_sulfur', name: 'Sulfur Drill', price: 1.2e25, val: 30000, res: 'Sulfur Shard', img: 'tools/33_sulfur_drill.png' },
        { id: 'j_storm', name: 'Crystal Harvester', price: 5.6e25, val: 80000, res: 'Storm Crystal', img: 'tools/34_crystal_harvester.png' },
        { id: 'j_hydrogen', name: 'Hydrogen Press', price: 2.4e26, val: 200000, res: 'Metallic Hydrogen', img: 'tools/35_hydrogen_press.png' },
        { id: 'j_plasma', name: 'Plasma Forge', price: 1e27, val: 500000, res: 'Plasma Core', img: 'tools/36_plasma_forge.png' },
        { id: 'j_essence', name: 'Essence Extractor', price: 4.8e27, val: 1500000, res: 'Great Red Essence', img: 'tools/37_essence_extractor.png' },
        { id: 'j_bolt', name: 'Lightning Rod', price: 2.4e28, val: 5000000, res: 'Lightning Bolt', img: 'tools/38_lightning_rod.png' }, 
        { id: 'j_gravity', name: 'Gravity Nullifier', price: 1.08e29, val: 15000000, res: 'Gravity Bead', img: 'tools/39_gravity_nullifier.png' },
        { id: 'j_singularity', name: 'Singularity Engine', price: 5e29, val: 50000000, res: 'Jovian Singularity', img: 'tools/40_singularity_engine.png' }
    ],

    // --- Saturn Tools (41-50) ---
    saturnTools: [
        { id: 's_dust', name: 'Dust Sweeper', price: 5e29, val: 5000, res: 'Ring Dust', img: 'tools/41_dust_sweeper.png' },
        { id: 's_ice', name: 'Ice Crusher', price: 3e30, val: 15000, res: 'Ice Fragment', img: 'tools/42_ice_crusher.png' },
        { id: 's_methane', name: 'Methane Pump', price: 1.2e31, val: 30000, res: 'Titan Methane', img: 'tools/43_methane_pump.png' },
        { id: 's_gas', name: 'Gas Scrubber', price: 5.6e31, val: 80000, res: 'Golden Gas', img: 'tools/44_gas_scrubber.png' },
        { id: 's_water', name: 'Water Purifier', price: 2.4e32, val: 200000, res: 'Enceladus Water', img: 'tools/45_water_purifier.png' },
        { id: 's_diamond', name: 'Diamond Peck', price: 1e33, val: 500000, res: 'Diamond Rain', img: 'tools/46_diamond_peck.png' },
        { id: 's_sand', name: 'Sand Sifter', price: 4.8e33, val: 1500000, res: 'Chronos Sand', img: 'tools/47_sand_sifter.png' },
        { id: 's_orbit', name: 'Orbit Anchor', price: 2.4e34, val: 5000000, res: 'Orbit Shutter', img: 'tools/48_orbit_anchor.png' }, 
        { id: 's_resonance', name: 'Resonance Tuner', price: 1.08e35, val: 15000000, res: 'Ring Resonance', img: 'tools/49_resonance_tuner.png' },
        { id: 's_crown', name: 'Crown Scanner', price: 5e35, val: 50000000, res: 'Saturnian Crown', img: 'tools/50_crown_scanner.png' }
    ],

    // --- Uranus Tools (51-60) ---
    uranusTools: [ 
        { id: 'u_vapor', name: 'Cyan Siphon', price: 5e35, val: 5000, res: 'Cyan Vapor', img: 'tools/51_cyan_siphon.png' },
        { id: 'u_slush', name: 'Methane Pusher', price: 3e36, val: 15000, res: 'Methane Slush', img: 'tools/52_methane_pusher.png' },
        { id: 'u_ice', name: 'Uranian Drill', price: 1.2e37, val: 30000, res: 'Uranian Ice', img: 'tools/53_uranian_drill.png' },
        { id: 'u_crystal', name: 'Crystal Splicer', price: 5.6e37, val: 80000, res: 'Cyan Crystal', img: 'tools/54_crystal_splicer.png' },
        { id: 'u_aqua', name: 'Aqua Digger', price: 2.4e38, val: 200000, res: 'Aquamarine Ore', img: 'tools/55_aqua_digger.png' },
        { id: 'u_diamond', name: 'Slush Collector', price: 1e39, val: 500000, res: 'Diamond Slush', img: 'tools/56_slush_collector.png' },
        { id: 'u_core', name: 'Frozen Harvester', price: 4.8e39, val: 1500000, res: 'Frozen Core', img: 'tools/57_frozen_harvester.png' },
        { id: 'u_mist', name: 'Aether Sorter', price: 2.4e40, val: 5000000, res: 'Aether Mist', img: 'tools/58_aether_sorter.png' }, 
        { id: 'u_shard', name: 'Tilted Grinder', price: 1.08e41, val: 15000000, res: 'Tilted Shard', img: 'tools/59_tilted_grinder.png' },
        { id: 'u_celestial', name: 'Celestial Engine', price: 5e41, val: 50000000, res: 'Celestial Ice', img: 'tools/60_celestial_engine.png' }
    ],

    // --- Neptune Tools (61-70) ---
    neptuneTools: [
        { id: 'n_mist', name: 'Azure Siphon', price: 5e41, val: 5000, res: 'Azure Mist', img: 'tools/61_azure_siphon.png' },
        { id: 'n_triton', name: 'Triton Pump', price: 3e42, val: 15000, res: 'Triton Liquid', img: 'tools/62_triton_pump.png' },
        { id: 'n_ice', name: 'Neptunian Drill', price: 1.2e43, val: 30000, res: 'Neptunian Ice', img: 'tools/63_neptunian_drill.png' },
        { id: 'n_essence', name: 'Storm Condenser', price: 5.6e43, val: 80000, res: 'Storm Essence', img: 'tools/64_storm_condenser.png' },
        { id: 'n_crystal', name: 'Azure Smasher', price: 2.4e44, val: 200000, res: 'Azure Crystal', img: 'tools/65_azure_smasher.png' },
        { id: 'n_core', name: 'Deep Sea Miner', price: 1e45, val: 500000, res: 'Deep Sea Core', img: 'tools/66_deep_sea_miner.png' },
        { id: 'n_bone', name: 'Whale Bone Saw', price: 4.8e45, val: 1500000, res: 'Whale Bone', img: 'tools/67_whale_bone_saw.png' },
        { id: 'n_pearl', name: 'Pearl Diver', price: 2.4e46, val: 5000000, res: 'Triton Pearl', img: 'tools/68_pearl_diver.png' },
        { id: 'n_abyss', name: 'Abyssal Forge', price: 1.08e47, val: 15000000, res: 'Abyssal Mist', img: 'tools/69_abyssal_forge.png' },
        { id: 'n_heart', name: 'Neptune Core', price: 5e47, val: 50000000, res: 'Neptunian Heart', img: 'tools/70_neptune_core.png' }
    ]
};