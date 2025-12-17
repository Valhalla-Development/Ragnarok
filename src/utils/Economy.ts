import {
    ActionRowBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    type ContainerBuilder,
    type EmbedBuilder,
    type ModalSubmitInteraction,
} from 'discord.js';
import '@colors/colors';
import type { Client } from 'discordx';
import { handleDeposit } from './economy/Bank.js';
import { handleClaim } from './economy/Claims.js';
import { ecoPrices } from './economy/Config.js';
import { handleFarm } from './economy/Farm.js';
import { handleFish } from './economy/Fish.js';
import { handleCoinflip } from './economy/Gamble.js';
import { handleHarvest } from './economy/Harvest.js';
import { handleHeist } from './economy/Heist.js';
import { handleHome } from './economy/Home.js';
import { handleBaltop } from './economy/Leaderboard.js';

export class Economy {
    homeButton: ButtonBuilder;
    baltopButton: ButtonBuilder;
    claimButton: ButtonBuilder;
    depositButton: ButtonBuilder;
    coinflipButton: ButtonBuilder;
    heistButton: ButtonBuilder;
    farmButton: ButtonBuilder;
    fishButton: ButtonBuilder;
    harvestButton: ButtonBuilder;
    itemsButton: ButtonBuilder;
    rows: ActionRowBuilder<ButtonBuilder>[] = [];
    homeEmbed: EmbedBuilder | null = null;
    homeContainer: ContainerBuilder | null = null;

    constructor() {
        this.homeButton = new ButtonBuilder()
            .setLabel('Home')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_home');

        this.baltopButton = new ButtonBuilder()
            .setLabel('Leaderboard')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_baltop');

        this.claimButton = new ButtonBuilder()
            .setLabel('Claim Rewards')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_claim');

        this.depositButton = new ButtonBuilder()
            .setLabel('Deposit Cash')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_deposit');

        this.coinflipButton = new ButtonBuilder()
            .setLabel('Coin Flip')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_coinflip');

        this.heistButton = new ButtonBuilder()
            .setLabel('Start Heist')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_heist');

        this.farmButton = new ButtonBuilder()
            .setLabel('Plant Crops')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_farm');

        this.fishButton = new ButtonBuilder()
            .setLabel('Go Fishing')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_fish');

        this.harvestButton = new ButtonBuilder()
            .setLabel('Harvest Crops')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_harvest');

        this.itemsButton = new ButtonBuilder()
            .setLabel('View Inventory')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('economy_items');

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.homeButton,
            this.baltopButton,
            this.claimButton,
            this.depositButton,
            this.coinflipButton
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            this.farmButton,
            this.fishButton,
            this.harvestButton
        );

        this.rows.push(row1, row2);

        // Bind methods to class instance
        this.home = this.home.bind(this);
        this.baltop = this.baltop.bind(this);
        this.deposit = this.deposit.bind(this);
        this.claim = this.claim.bind(this);
        this.coinflip = this.coinflip.bind(this);
        this.heist = this.heist.bind(this);
        this.farm = this.farm.bind(this);
        this.fish = this.fish.bind(this);
        this.harvest = this.harvest.bind(this);
    }

    /**
     * Get the button instances for other modules
     */
    private getButtons() {
        return {
            baltopButton: this.baltopButton,
            depositButton: this.depositButton,
            heistButton: this.heistButton,
            fishButton: this.fishButton,
            farmButton: this.farmButton,
            itemsButton: this.itemsButton,
            claimButton: this.claimButton,
        };
    }

    /**
     * Asynchronously handles the home interaction (Command or Button).
     */
    async home(interaction: CommandInteraction | ButtonInteraction, client: Client) {
        await handleHome(interaction, client, this.getButtons());
    }

    /**
     * Asynchronously handles the baltop button interaction.
     */
    async baltop(interaction: ButtonInteraction, client: Client) {
        await handleBaltop(interaction, client, this.homeButton);
    }

    /**
     * Asynchronously handles the deposit button interaction.
     */
    async deposit(interaction: ButtonInteraction, client: Client) {
        await handleDeposit(interaction, client, this.getButtons());
    }

    /**
     * Asynchronously handles the claim button interaction.
     */
    async claim(interaction: ButtonInteraction, client: Client) {
        await handleClaim(interaction, client, this.claimButton, this.rows, this.getButtons());
    }

    /**
     * Asynchronously handles the coinflip interaction.
     */
    async coinflip(
        interaction: ModalSubmitInteraction | ButtonInteraction,
        client: Client,
        amount: string | null = null,
        option: string | null = null
    ) {
        await handleCoinflip(
            interaction,
            client,
            this.coinflipButton,
            this.homeButton,
            this.homeEmbed,
            this.rows,
            this.getButtons(),
            amount,
            option
        );
    }

    /**
     * Asynchronously handles the farm interaction.
     */
    async farm(interaction: ButtonInteraction, client: Client) {
        await handleFarm(
            interaction,
            client,
            this.farmButton,
            this.homeButton,
            this.homeEmbed,
            this.rows,
            this.getButtons()
        );
    }

    /**
     * Asynchronously handles the fish interaction.
     */
    async fish(interaction: ButtonInteraction, client: Client) {
        await handleFish(
            interaction,
            client,
            this.fishButton,
            this.homeButton,
            this.homeEmbed,
            this.rows,
            this.getButtons()
        );
    }

    /**
     * Asynchronously handles the heist interaction.
     */
    async heist(interaction: ButtonInteraction) {
        await handleHeist(interaction, this.homeButton);
    }

    /**
     * Asynchronously handles the harvest interaction.
     */
    async harvest(interaction: ButtonInteraction, client: Client) {
        await handleHarvest(interaction, client, this.harvestButton, this.homeButton, this.rows);
    }

    /**
     * Get the economy prices configuration
     */
    getEcoPrices() {
        return ecoPrices;
    }
}

export * from './economy/Bank.js';
export * from './economy/Claims.js';
export { ecoPrices } from './economy/Config.js';
export * from './economy/Farm.js';
export * from './economy/Fish.js';
export * from './economy/Gamble.js';
export * from './economy/Harvest.js';
export * from './economy/Heist.js';
export * from './economy/Home.js';
export * from './economy/Leaderboard.js';
// Export all the types and config for external use
export * from './economy/Types.js';
