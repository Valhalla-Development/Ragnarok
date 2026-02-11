export const ecoPrices = {
    // Messaging Rewards
    messaging: {
        minPerMessage: 8,
        maxPerMessage: 16,
    },

    // User Claims
    claims: {
        hourly: { min: 200, max: 350 },
        daily: { min: 1200, max: 2200 },
        weekly: { min: 7000, max: 12_000 },
        monthly: { min: 30_000, max: 50_000 },
        newUserTime: 21_600_000, // 6 hours
    },

    // Fishing
    fishing: {
        items: {
            fishBagFirst: 80,
            fishBagLimit: 1200,
            fishBagPrice: 12, // Upgrade adds 30 to capacity
            fishingRod: 14_000,
        },
        rewards: {
            treasure: 45_000,
            pufferfish: 3500,
            swordfish: 1800,
            kingSalmon: 900,
            trout: 300,
        },
        cooldowns: {
            fishWinTime: 300_000, // 5 Minutes
            fishFailTime: 540_000, // 9 Minutes
        },
    },

    // Farming
    farming: {
        items: {
            farmPlotFirst: 25,
            farmPlotLimit: 600,
            farmPlotPrice: 15, // Upgrade adds 30 to capacity
            farmingTools: 12_000,
            farmBagFirst: 80,
            farmBagLimit: 2400,
            farmBagPrice: 10, // Upgrade adds 30 to capacity
        },
        rewards: {
            goldBar: 22_000,
            corn: 700,
            wheat: 560,
            potatoes: 450,
            tomatoes: 340,
        },
        plantingTimes: {
            cornPlant: 900_000, // 15 minutes
            wheatPlant: 600_000, // 10 minutes
            potatoPlant: 420_000, // 7 minutes
            tomatoPlant: 300_000, // 5 minutes
        },
        decayRate: 0.03, // Per-minute decay for harvestable crops
        farmingWithoutTools: {
            goldNugget: 9000,
            barley: 380,
            spinach: 260,
            strawberries: 180,
            lettuce: 120,
        },
        cooldowns: {
            farmWinTime: 300_000, // 5 Minutes
            farmFailTime: 540_000, // 9 Minutes
        },
        freeFarmLimit: 12,
    },

    // Boosts
    boosts: {
        seedBagFirst: 80,
        seedBagLimit: 1200,
        seedBagPrice: 10, // Upgrade adds 30 to capacity
        seeds: {
            cornSeed: 3000, // 10 per pack
            wheatSeed: 2400,
            potatoSeed: 2000,
            tomatoSeed: 1700,
        },
    },
};
