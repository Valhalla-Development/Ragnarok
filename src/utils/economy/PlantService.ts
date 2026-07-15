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
            growMs: ecoPrices.farming.plantingTimes.cornPlant,
            label: 'Corn',
            seed: 'CornSeeds',
        },
        potato: {
            growMs: ecoPrices.farming.plantingTimes.potatoPlant,
            label: 'Potato',
            seed: 'PotatoSeeds',
        },
        tomato: {
            growMs: ecoPrices.farming.plantingTimes.tomatoPlant,
            label: 'Tomato',
            seed: 'TomatoSeeds',
        },
        wheat: {
            growMs: ecoPrices.farming.plantingTimes.wheatPlant,
            label: 'Wheat',
            seed: 'WheatSeeds',
        },
    };

    const crop = meta[type];
    const plotCap = num(balance.Boosts!.FarmPlot);
    if (plotCap <= 0 || !balance.Items!.FarmingTools) {
        return {
            message: 'You need farming tools and farm plots first (`/economy` -> Shop).',
            ok: false,
        };
    }

    const seeds = num(balance.Items![crop.seed]);
    if (seeds < amount) {
        return {
            message: `Not enough ${crop.label.toLowerCase()} seeds. You have \`${seeds}\`.`,
            ok: false,
        };
    }

    const usedPlots = balance.FarmPlot?.length ?? 0;
    const freePlots = Math.max(0, plotCap - usedPlots);
    if (amount > freePlots) {
        return {
            message: `Not enough plot space. Free plots: \`${freePlots}\`.`,
            ok: false,
        };
    }

    const now = Date.now();
    const growTime = now + crop.growMs;
    for (let i = 0; i < amount; i += 1) {
        balance.FarmPlot.push({
            CropGrowTime: growTime,
            CropStatus: 'planting',
            CropType: type,
            Decay: 0,
            LastUpdateTime: now,
        });
    }
    balance.Items![crop.seed] = seeds - amount;
    await save(balance);

    return {
        message: `Planted \`${amount}\` ${crop.label.toLowerCase()} seed${amount > 1 ? 's' : ''}. Plots: \`${balance.FarmPlot.length}\`/\`${plotCap}\`.`,
        ok: true,
    };
}

function ensureItems(balance: BalanceInterface) {
    if (!balance.Items) {
        balance.Items = {
            Barley: 0,
            CornSeeds: 0,
            FarmingTools: false,
            FishingRod: false,
            GoldBar: 0,
            GoldNugget: 0,
            KingSalmon: 0,
            Lettuce: 0,
            PotatoSeeds: 0,
            PufferFish: 0,
            Spinach: 0,
            Strawberries: 0,
            SwordFish: 0,
            TomatoSeeds: 0,
            Treasure: 0,
            Trout: 0,
            WheatSeeds: 0,
        };
    }
}

function ensureBoosts(balance: BalanceInterface) {
    if (!balance.Boosts) {
        balance.Boosts = {
            AutoDeposit: false,
            FarmBag: 0,
            FarmPlot: 0,
            FishBag: 0,
            SeedBag: 0,
        };
    }
}

function num(v: unknown): number {
    return Number(v ?? 0);
}

async function save(balance: BalanceInterface) {
    await (balance as unknown as { save: () => Promise<void> }).save();
}
