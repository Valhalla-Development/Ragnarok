import type { BalanceInterface } from '../../mongo/Balance.js';
import { ecoPrices } from './Config.js';

export type ShopAction = 'buy' | 'sell' | 'upgrade';
export type ShopMode = ShopAction;
export type ShopItem =
    | 'rod'
    | 'tools'
    | 'corn'
    | 'wheat'
    | 'potato'
    | 'tomato'
    | 'all'
    | 'fish'
    | 'farm'
    | 'crops'
    | 'treasure'
    | 'seedbag'
    | 'fishbag'
    | 'farmbag'
    | 'plot';

const SEED_PACK_SIZE = 10;
const UPGRADE_STEP = 30;
const UPGRADE_COST_MULTIPLIER = 3;
type SeedItem = 'corn' | 'wheat' | 'potato' | 'tomato';

export function runShopAction(
    balance: BalanceInterface,
    action: ShopAction,
    item: ShopItem,
    quantity = 1
): Promise<{ ok: boolean; message: string }> {
    if (action === 'buy') {
        return doBuy(balance, item, quantity);
    }
    if (action === 'sell') {
        return doSell(balance, item);
    }
    return doUpgrade(balance, item);
}

async function doBuy(
    balance: BalanceInterface,
    item: ShopItem,
    quantity: number
): Promise<{ ok: boolean; message: string }> {
    ensureItems(balance);
    ensureBoosts(balance);
    const qty = Math.max(1, quantity);

    if (item === 'rod') {
        if (balance.Items!.FishingRod) {
            return { ok: false, message: 'You already own a fishing rod.' };
        }
        const cost = ecoPrices.fishing.items.fishingRod;
        if (!hasBank(balance, cost)) {
            return {
                ok: false,
                message: `Not enough bank coins. Need ${fmt(cost - bank(balance))} more.`,
            };
        }
        spendBank(balance, cost);
        balance.Items!.FishingRod = true;
        if (!num(balance.Boosts!.FishBag)) {
            balance.Boosts!.FishBag = ecoPrices.fishing.items.fishBagFirst;
        }
        await save(balance);
        return { ok: true, message: `Bought fishing rod for ${fmt(cost)}.` };
    }

    if (item === 'tools') {
        if (balance.Items!.FarmingTools) {
            return { ok: false, message: 'You already own farming tools.' };
        }
        const cost = ecoPrices.farming.items.farmingTools;
        if (!hasBank(balance, cost)) {
            return {
                ok: false,
                message: `Not enough bank coins. Need ${fmt(cost - bank(balance))} more.`,
            };
        }

        const legacyValue =
            num(balance.Items!.Barley) * ecoPrices.farming.farmingWithoutTools.barley +
            num(balance.Items!.Spinach) * ecoPrices.farming.farmingWithoutTools.spinach +
            num(balance.Items!.Strawberries) * ecoPrices.farming.farmingWithoutTools.strawberries +
            num(balance.Items!.Lettuce) * ecoPrices.farming.farmingWithoutTools.lettuce;

        spendBank(balance, cost);
        addBank(balance, legacyValue);
        balance.Items!.FarmingTools = true;
        balance.Boosts!.FarmBag = ecoPrices.farming.items.farmBagFirst;
        balance.Boosts!.SeedBag = ecoPrices.boosts.seedBagFirst;
        balance.Boosts!.FarmPlot = ecoPrices.farming.items.farmPlotFirst;
        balance.Items!.Barley = 0;
        balance.Items!.Spinach = 0;
        balance.Items!.Strawberries = 0;
        balance.Items!.Lettuce = 0;
        await save(balance);
        return { ok: true, message: `Bought farming tools for ${fmt(cost)}.` };
    }

    if (!isSeedItem(item)) {
        return { ok: false, message: 'Invalid buy option.' };
    }
    if (!balance.Items!.FarmingTools) {
        return { ok: false, message: 'You need farming tools before buying seeds.' };
    }

    const seedMeta: Record<
        SeedItem,
        {
            key: 'CornSeeds' | 'WheatSeeds' | 'PotatoSeeds' | 'TomatoSeeds';
            cost: number;
            name: string;
        }
    > = {
        corn: { key: 'CornSeeds', cost: ecoPrices.boosts.seeds.cornSeed, name: 'corn seeds' },
        wheat: { key: 'WheatSeeds', cost: ecoPrices.boosts.seeds.wheatSeed, name: 'wheat seeds' },
        potato: {
            key: 'PotatoSeeds',
            cost: ecoPrices.boosts.seeds.potatoSeed,
            name: 'potato seeds',
        },
        tomato: {
            key: 'TomatoSeeds',
            cost: ecoPrices.boosts.seeds.tomatoSeed,
            name: 'tomato seeds',
        },
    };

    const bagCap = num(balance.Boosts!.SeedBag);
    const currentSeeds = totalSeeds(balance);
    const addSeeds = qty * SEED_PACK_SIZE;
    if (currentSeeds + addSeeds > bagCap) {
        return {
            ok: false,
            message: `Seed bag full. Capacity: \`${currentSeeds}\`/\`${bagCap}\`.`,
        };
    }

    const seed = seedMeta[item];
    const totalCost = seed.cost * qty;
    if (!hasBank(balance, totalCost)) {
        return {
            ok: false,
            message: `Not enough bank coins. Need ${fmt(totalCost - bank(balance))} more.`,
        };
    }

    spendBank(balance, totalCost);
    balance.Items![seed.key] = num(balance.Items![seed.key]) + addSeeds;
    await save(balance);
    return {
        ok: true,
        message: `Bought \`${addSeeds}\` ${seed.name} for ${fmt(totalCost)}.`,
    };
}

async function doUpgrade(
    balance: BalanceInterface,
    item: ShopItem
): Promise<{ ok: boolean; message: string }> {
    ensureBoosts(balance);

    const map = {
        seedbag: {
            key: 'SeedBag' as const,
            max: ecoPrices.boosts.seedBagLimit,
            price: ecoPrices.boosts.seedBagPrice,
            name: 'Seed Bag',
        },
        fishbag: {
            key: 'FishBag' as const,
            max: ecoPrices.fishing.items.fishBagLimit,
            price: ecoPrices.fishing.items.fishBagPrice,
            name: 'Fish Bag',
        },
        farmbag: {
            key: 'FarmBag' as const,
            max: ecoPrices.farming.items.farmBagLimit,
            price: ecoPrices.farming.items.farmBagPrice,
            name: 'Farm Bag',
        },
        plot: {
            key: 'FarmPlot' as const,
            max: ecoPrices.farming.items.farmPlotLimit,
            price: ecoPrices.farming.items.farmPlotPrice,
            name: 'Farm Plot',
        },
    };

    if (!(item in map)) {
        return { ok: false, message: 'Invalid upgrade option.' };
    }
    const target = map[item as keyof typeof map];
    const current = num(balance.Boosts![target.key]);
    if (current <= 0) {
        return { ok: false, message: `You do not own ${target.name} yet.` };
    }
    if (current >= target.max) {
        return { ok: false, message: `${target.name} is already maxed.` };
    }

    const cost = current * target.price * UPGRADE_COST_MULTIPLIER;
    if (!hasBank(balance, cost)) {
        return {
            ok: false,
            message: `Not enough bank coins. Need ${fmt(cost - bank(balance))} more.`,
        };
    }

    spendBank(balance, cost);
    balance.Boosts![target.key] = Math.min(target.max, current + UPGRADE_STEP);
    await save(balance);
    return {
        ok: true,
        message: `${target.name} upgraded for ${fmt(cost)}. New capacity: \`${num(balance.Boosts![target.key])}\`.`,
    };
}

async function doSell(
    balance: BalanceInterface,
    item: ShopItem
): Promise<{ ok: boolean; message: string }> {
    ensureItems(balance);
    const items = balance.Items!;
    const harvested = balance.HarvestedCrops ?? [];

    const sellFish = () => {
        const value =
            num(items.Trout) * ecoPrices.fishing.rewards.trout +
            num(items.KingSalmon) * ecoPrices.fishing.rewards.kingSalmon +
            num(items.SwordFish) * ecoPrices.fishing.rewards.swordfish +
            num(items.PufferFish) * ecoPrices.fishing.rewards.pufferfish;
        const count =
            num(items.Trout) + num(items.KingSalmon) + num(items.SwordFish) + num(items.PufferFish);
        items.Trout = 0;
        items.KingSalmon = 0;
        items.SwordFish = 0;
        items.PufferFish = 0;
        return { value, count };
    };

    const sellTreasure = () => {
        const value =
            num(items.Treasure) * ecoPrices.fishing.rewards.treasure +
            num(items.GoldBar) * ecoPrices.farming.rewards.goldBar +
            num(items.GoldNugget) * ecoPrices.farming.farmingWithoutTools.goldNugget;
        const count = num(items.Treasure) + num(items.GoldBar) + num(items.GoldNugget);
        items.Treasure = 0;
        items.GoldBar = 0;
        items.GoldNugget = 0;
        return { value, count };
    };

    const sellFarm = () => {
        const looseValue =
            num(items.Barley) * ecoPrices.farming.farmingWithoutTools.barley +
            num(items.Spinach) * ecoPrices.farming.farmingWithoutTools.spinach +
            num(items.Strawberries) * ecoPrices.farming.farmingWithoutTools.strawberries +
            num(items.Lettuce) * ecoPrices.farming.farmingWithoutTools.lettuce;
        const looseCount =
            num(items.Barley) + num(items.Spinach) + num(items.Strawberries) + num(items.Lettuce);
        let cropValue = 0;
        for (const crop of harvested) {
            cropValue += Math.floor(cropPrice(crop.CropType) * (1 - num(crop.Decay) / 100));
        }
        const cropCount = harvested.length;
        items.Barley = 0;
        items.Spinach = 0;
        items.Strawberries = 0;
        items.Lettuce = 0;
        balance.HarvestedCrops.splice(0, balance.HarvestedCrops.length);
        return { value: looseValue + cropValue, count: looseCount + cropCount };
    };

    let sold = { value: 0, count: 0 };
    if (item === 'fish') {
        sold = sellFish();
    } else if (item === 'treasure') {
        sold = sellTreasure();
    } else if (item === 'farm' || item === 'crops') {
        sold = sellFarm();
    } else if (item === 'all') {
        const fish = sellFish();
        const treasure = sellTreasure();
        const farm = sellFarm();
        sold = {
            value: fish.value + treasure.value + farm.value,
            count: fish.count + treasure.count + farm.count,
        };
    } else {
        return { ok: false, message: 'Invalid sell option.' };
    }

    if (sold.value <= 0 || sold.count <= 0) {
        return { ok: false, message: 'Nothing to sell in that category.' };
    }

    addBank(balance, sold.value);
    await save(balance);
    return { ok: true, message: `Sold \`${sold.count}\` item(s) for ${fmt(sold.value)}.` };
}

function isSeedItem(item: ShopItem): item is SeedItem {
    return ['corn', 'wheat', 'potato', 'tomato'].includes(item);
}

function cropPrice(crop: string): number {
    if (crop === 'corn') {
        return ecoPrices.farming.rewards.corn;
    }
    if (crop === 'wheat') {
        return ecoPrices.farming.rewards.wheat;
    }
    if (crop === 'potato') {
        return ecoPrices.farming.rewards.potatoes;
    }
    if (crop === 'tomato') {
        return ecoPrices.farming.rewards.tomatoes;
    }
    return 0;
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
        balance.Boosts = { FishBag: 0, SeedBag: 0, FarmBag: 0, FarmPlot: 0 };
    }
}

function num(v: unknown): number {
    return Number(v ?? 0);
}
function fmt(v: number): string {
    return `💰 \`${Math.max(0, Math.floor(v)).toLocaleString('en')}\``;
}
function bank(b: BalanceInterface): number {
    return num(b.Bank);
}
function hasBank(b: BalanceInterface, c: number): boolean {
    return bank(b) >= c;
}
function spendBank(b: BalanceInterface, c: number) {
    b.Bank = num(b.Bank) - c;
    b.Total = num(b.Total) - c;
}
function addBank(b: BalanceInterface, a: number) {
    b.Bank = num(b.Bank) + a;
    b.Total = num(b.Total) + a;
}
function totalSeeds(balance: BalanceInterface) {
    return (
        num(balance.Items?.CornSeeds) +
        num(balance.Items?.WheatSeeds) +
        num(balance.Items?.PotatoSeeds) +
        num(balance.Items?.TomatoSeeds)
    );
}
async function save(balance: BalanceInterface) {
    await (balance as unknown as { save: () => Promise<void> }).save();
}
