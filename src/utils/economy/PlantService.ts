import type { BalanceInterface } from '../../mongo/Balance.js';
import { ecoPrices } from './Config.js';

export type CropType = 'corn' | 'wheat' | 'potato' | 'tomato';

export async function runPlantAction(
    balance: BalanceInterface,
    type: CropType,
    amount: number
): Promise<{ ok: boolean; message: string }> {
    ensureItems(balance);
    ensureBoosts(balance);

    const meta: Record<
        CropType,
        {
            seed: 'CornSeeds' | 'WheatSeeds' | 'PotatoSeeds' | 'TomatoSeeds';
            growMs: number;
            label: string;
        }
    > = {
        corn: {
            seed: 'CornSeeds',
            growMs: ecoPrices.farming.plantingTimes.cornPlant,
            label: 'Corn',
        },
        wheat: {
            seed: 'WheatSeeds',
            growMs: ecoPrices.farming.plantingTimes.wheatPlant,
            label: 'Wheat',
        },
        potato: {
            seed: 'PotatoSeeds',
            growMs: ecoPrices.farming.plantingTimes.potatoPlant,
            label: 'Potato',
        },
        tomato: {
            seed: 'TomatoSeeds',
            growMs: ecoPrices.farming.plantingTimes.tomatoPlant,
            label: 'Tomato',
        },
    };

    const crop = meta[type];
    const plotCap = num(balance.Boosts!.FarmPlot);
    if (plotCap <= 0 || !balance.Items!.FarmingTools) {
        return {
            ok: false,
            message: 'You need farming tools and farm plots first (`/economy` -> Shop).',
        };
    }

    const seeds = num(balance.Items![crop.seed]);
    if (seeds < amount) {
        return {
            ok: false,
            message: `Not enough ${crop.label.toLowerCase()} seeds. You have \`${seeds}\`.`,
        };
    }

    const usedPlots = balance.FarmPlot?.length ?? 0;
    const freePlots = Math.max(0, plotCap - usedPlots);
    if (amount > freePlots) {
        return {
            ok: false,
            message: `Not enough plot space. Free plots: \`${freePlots}\`.`,
        };
    }

    const now = Date.now();
    const growTime = now + crop.growMs;
    for (let i = 0; i < amount; i++) {
        balance.FarmPlot.push({
            CropType: type,
            CropStatus: 'planting',
            CropGrowTime: growTime,
            Decay: 0,
            LastUpdateTime: now,
        });
    }
    balance.Items![crop.seed] = seeds - amount;
    await save(balance);

    return {
        ok: true,
        message: `Planted \`${amount}\` ${crop.label.toLowerCase()} seed${amount > 1 ? 's' : ''}. Plots: \`${balance.FarmPlot.length}\`/\`${plotCap}\`.`,
    };
}

function ensureItems(balance: BalanceInterface) {
    if (!balance.Items) {
        balance.Items = {
            Trout: 0,
            KingSalmon: 0,
            SwordFish: 0,
            PufferFish: 0,
            Treasure: 0,
            GoldBar: 0,
            GoldNugget: 0,
            Barley: 0,
            Spinach: 0,
            Strawberries: 0,
            Lettuce: 0,
            CornSeeds: 0,
            WheatSeeds: 0,
            PotatoSeeds: 0,
            TomatoSeeds: 0,
            FarmingTools: false,
            FishingRod: false,
        };
    }
}

function ensureBoosts(balance: BalanceInterface) {
    if (!balance.Boosts) {
        balance.Boosts = {
            FishBag: 0,
            SeedBag: 0,
            FarmBag: 0,
            FarmPlot: 0,
            AutoDeposit: false,
        };
    }
}

function num(v: unknown): number {
    return Number(v ?? 0);
}

async function save(balance: BalanceInterface) {
    await (balance as unknown as { save: () => Promise<void> }).save();
}
