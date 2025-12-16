export type EcoPrices = {
    Hourly: { min: number; max: number };
    Daily: { min: number; max: number };
    Weekly: { min: number; max: number };
    Monthly: { min: number; max: number };
};

export type Claim = {
    Hourly?: number;
    Daily?: number;
    Weekly?: number;
    Monthly?: number;
};

export type Items = {
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
};

export type CropData = {
    CropStatus: string;
    CropType: string;
    Decay: number;
    CropGrowTime: number | string;
    LastUpdateTime?: number;
};

import type { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export type HarvestResult = {
    crops: CropData[];
    totalValue: number;
    displayEntries: string[];
};

export type ButtonRows = ActionRowBuilder<ButtonBuilder>[];
