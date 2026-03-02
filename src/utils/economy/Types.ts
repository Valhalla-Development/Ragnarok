export interface EcoPrices {
    Daily: { min: number; max: number };
    Hourly: { min: number; max: number };
    Monthly: { min: number; max: number };
    Weekly: { min: number; max: number };
}

export interface Claim {
    Daily?: number;
    Hourly?: number;
    Monthly?: number;
    Weekly?: number;
}

export interface Items {
    Barley: number;
    CornSeeds: number;
    FarmingTools: boolean;
    FishingRod: boolean;
    GoldBar: number;
    GoldNugget: number;
    KingSalmon: number;
    Lettuce: number;
    PotatoSeeds: number;
    PufferFish: number;
    Spinach: number;
    Strawberries: number;
    SwordFish: number;
    TomatoSeeds: number;
    Treasure: number;
    Trout: number;
    WheatSeeds: number;
}

export interface CropData {
    CropGrowTime: number | string;
    CropStatus: string;
    CropType: string;
    Decay: number;
    LastUpdateTime?: number;
}

import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export interface HarvestResult {
    crops: CropData[];
    displayEntries: string[];
    totalValue: number;
}

export type ButtonRows = ActionRowBuilder<ButtonBuilder>[];
