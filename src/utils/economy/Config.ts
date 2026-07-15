export const ecoPrices = {
    // Boosts
    boosts: {
        autoDepositPrice: 250_000,
        seedBagFirst: 80,
        seedBagLimit: 1200,
        seedBagPrice: 10, // Upgrade adds 30 to capacity
        seeds: {
            cornSeed: 3000, // 10 per pack
            potatoSeed: 2000,
            tomatoSeed: 1700,
            wheatSeed: 2400,
        },
    },

    // User Claims
    claims: {
        daily: { max: 2200, min: 1200 },
        hourly: { max: 350, min: 200 },
        monthly: { max: 50_000, min: 30_000 },
        newUserTime: 21_600_000, // 6 hours
        weekly: { max: 12_000, min: 7000 },
    },

    // Farming
    farming: {
        cooldowns: {
            farmFailTime: 540_000, // 9 Minutes
            farmWinTime: 300_000, // 5 Minutes
        },
        decayRate: 0.03, // Per-minute decay for harvestable crops
        farmingWithoutTools: {
            barley: 380,
            goldNugget: 9000,
            lettuce: 120,
            spinach: 260,
            strawberries: 180,
        },
        freeFarmLimit: 12,
        items: {
            farmBagFirst: 80,
            farmBagLimit: 2400,
            farmBagPrice: 10, // Upgrade adds 30 to capacity
            farmingTools: 12_000,
            farmPlotFirst: 25,
            farmPlotLimit: 600,
            farmPlotPrice: 15, // Upgrade adds 30 to capacity
        },
        plantingTimes: {
            cornPlant: 900_000, // 15 minutes
            potatoPlant: 420_000, // 7 minutes
            tomatoPlant: 300_000, // 5 minutes
            wheatPlant: 600_000, // 10 minutes
        },
        rewards: {
            corn: 700,
            goldBar: 22_000,
            potatoes: 450,
            tomatoes: 340,
            wheat: 560,
        },
    },

    // Fishing
    fishing: {
        cooldowns: {
            fishFailTime: 540_000, // 9 Minutes
            fishWinTime: 300_000, // 5 Minutes
        },
        items: {
            fishBagFirst: 80,
            fishBagLimit: 1200,
            fishBagPrice: 12, // Upgrade adds 30 to capacity
            fishingRod: 14_000,
        },
        rewards: {
            kingSalmon: 900,
            pufferfish: 3500,
            swordfish: 1800,
            treasure: 45_000,
            trout: 300,
        },
    },
    // Messaging Rewards
    messaging: {
        maxPerMessage: 16,
        minPerMessage: 8,
    },
};
