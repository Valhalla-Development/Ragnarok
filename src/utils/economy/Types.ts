export interface EcoPrices {
    Hourly: { min: number; max: number };
    Daily: { min: number; max: number };
    Weekly: { min: number; max: number };
    Monthly: { min: number; max: number };
}

export interface Claim {
    Hourly?: number;
    Daily?: number;
    Weekly?: number;
    Monthly?: number;
}

export interface Items {
    Trout: number;
    KingSalmon: number;
    SwordFish: number;
    PufferFish: number;
    Treasure: number;
    GoldBar: number;
    GoldNugget: number;
    Barley: number;
    Spinach: number;
    Strawberries: number;
    Lettuce: number;
    CornSeeds: number;
    WheatSeeds: number;
    PotatoSeeds: number;
    TomatoSeeds: number;
    FarmingTools: boolean;
    FishingRod: boolean;
}

export interface CropData {
    CropStatus: string;
    CropType: string;
    Decay: number;
    CropGrowTime: number | string;
    LastUpdateTime?: number;
}

import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export interface HarvestResult {
    crops: CropData[];
    totalValue: number;
    displayEntries: string[];
}

export type ButtonRows = ActionRowBuilder<ButtonBuilder>[];
