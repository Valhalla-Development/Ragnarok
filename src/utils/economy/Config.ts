export const ecoPrices = {
    // Messaging Rewards
    messaging: {
        minPerMessage: 10,
        maxPerMessage: 30,
    },

    // User Claims
    claims: {
        hourly: { min: 150, max: 400 },
        daily: { min: 400, max: 800 },
        weekly: { min: 2000, max: 3000 },
        monthly: { min: 10_000, max: 15_000 },
        newUserTime: 172_800_000, // 2 Days
    },

    // Fishing
    fishing: {
        items: {
            fishBagFirst: 200,
            fishBagLimit: 1500,
            fishBagPrice: 800, // Upgrade adds 30 to capacity
            fishingRod: 25_000,
        },
        rewards: {
            treasure: 75_000,
            pufferfish: 5000,
            swordfish: 2500,
            kingSalmon: 1000,
            trout: 400,
        },
        cooldowns: {
            fishWinTime: 240_000, // 4 Minutes
            fishFailTime: 480_000, // 8 Minutes
        },
    },

    // Farming
    farming: {
        items: {
            farmPlotFirst: 150,
            farmPlotLimit: 1200,
            farmPlotPrice: 800, // Upgrade adds 30 to capacity
            farmingTools: 20_000,
            farmBagFirst: 150,
            farmBagLimit: 12_000,
            farmBagPrice: 800, // Upgrade adds 30 to capacity
        },
        rewards: {
            goldBar: 30_000,
            corn: 800,
            wheat: 600,
            potatoes: 500,
            tomatoes: 450,
        },
        plantingTimes: {
            cornPlant: 480_000, // 8 minutes
            wheatPlant: 360_000, // 6 minutes
            potatoPlant: 180_000, // 3 minutes
            tomatoPlant: 120_000, // 2 minutes
        },
        decayRate: 0.015, // Lowered decay rate for better long-term value
        farmingWithoutTools: {
            goldNugget: 15_000,
            barley: 600,
            spinach: 400,
            strawberries: 200,
            lettuce: 150,
        },
        cooldowns: {
            farmWinTime: 240_000, // 4 Minutes
            farmFailTime: 480_000, // 8 Minutes
        },
        freeFarmLimit: 10,
    },

    // Boosts
    boosts: {
        seedBagFirst: 150,
        seedBagLimit: 1200,
        seedBagPrice: 800, // Upgrade adds 30 to capacity
        seeds: {
            cornSeed: 5000, // 15 per pack
            wheatSeed: 4000,
            potatoSeed: 3500,
            tomatoSeed: 3200,
        },
    },
};
